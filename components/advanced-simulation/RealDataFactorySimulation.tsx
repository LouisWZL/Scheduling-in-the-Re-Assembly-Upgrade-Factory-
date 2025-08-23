'use client'

import { useState, useEffect, useCallback } from 'react';
import { useFactory } from '@/contexts/factory-context';
import { getAdvancedSimulationData } from '@/app/actions/advanced-simulation.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Pause, Square, RefreshCw, Settings, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PrismaClient } from '@prisma/client';
import { 
  ReactFlow,
  Node, 
  Edge, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SimulationStation {
  id: string;
  name: string;
  type: 'MAIN' | 'SUB';
  phase?: string;
  processingTime: number; // in minutes
  stochasticVariation: number; // percentage (0-1)
  currentOrders: any[];
  baugruppentypId?: string;
  parent?: string;
}

interface SimulationOrder {
  id: string;
  kundeId: string;
  kundeName: string;
  produktvariante: string;
  currentStation: string;
  progress: number;
  startTime: Date;
  stationStartTime?: Date;
  processSequence: string[];
  requiredBaugruppentypen: string[];
  stationDurations: { [stationId: string]: { expected: number; actual?: number; startTime?: Date } };
}

export function RealDataFactorySimulation() {
  const { activeFactory } = useFactory();
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [simulationTime, setSimulationTime] = useState(new Date());
  const [lastRealTime, setLastRealTime] = useState(Date.now());
  
  // Simulation data
  const [stations, setStations] = useState<SimulationStation[]>([]);
  const [orders, setOrders] = useState<SimulationOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<SimulationOrder[]>([]);
  const [factoryData, setFactoryData] = useState<any>(null);
  
  // Flow diagram nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Station configuration dialog
  const [selectedStation, setSelectedStation] = useState<SimulationStation | null>(null);
  const [stationDialogOpen, setStationDialogOpen] = useState(false);
  const [tempProcessingTime, setTempProcessingTime] = useState(0);

  // Load factory data
  useEffect(() => {
    if (activeFactory) {
      loadSimulationData();
    }
  }, [activeFactory]);

  const loadSimulationData = async () => {
    if (!activeFactory) return;
    
    setLoading(true);
    try {
      const result = await getAdvancedSimulationData(activeFactory.id);
      
      if (result.success && result.data) {
        setFactoryData(result.data);
        
        // Initialize stations with stochastic variations
        const mainStations: SimulationStation[] = [
          { id: 'order-acceptance', name: 'Auftragsannahme', type: 'MAIN', phase: 'AUFTRAGSANNAHME', processingTime: 5, stochasticVariation: 0.2, currentOrders: [] },
          { id: 'inspection', name: 'Inspektion', type: 'MAIN', phase: 'INSPEKTION', processingTime: 15, stochasticVariation: 0.3, currentOrders: [] },
          { id: 'demontage', name: 'Demontage', type: 'MAIN', phase: 'DEMONTAGE', processingTime: 0, stochasticVariation: 0.25, currentOrders: [] },
          { id: 'reassembly', name: 'Re-Assembly', type: 'MAIN', phase: 'REASSEMBLY', processingTime: 0, stochasticVariation: 0.25, currentOrders: [] },
          { id: 'quality', name: 'Qualitätsprüfung', type: 'MAIN', phase: 'QUALITAETSPRUEFUNG', processingTime: 20, stochasticVariation: 0.4, currentOrders: [] },
          { id: 'shipping', name: 'Versand', type: 'MAIN', phase: 'VERSAND', processingTime: 10, stochasticVariation: 0.2, currentOrders: [] }
        ];
        
        // Add sub-stations for Demontage and Re-Assembly based on Baugruppentypen
        const demontageSubStations: SimulationStation[] = result.data.stations.demontageSubStations.map((sub: any) => ({
          id: `demontage-${sub.id}`,
          name: sub.name,
          type: 'SUB' as const,
          parent: 'demontage',
          baugruppentypId: sub.baugruppentypId,
          processingTime: 30, // Default 30 minutes
          stochasticVariation: 0.3,
          currentOrders: []
        }));
        
        const reassemblySubStations: SimulationStation[] = result.data.stations.reassemblySubStations.map((sub: any) => ({
          id: `reassembly-${sub.id}`,
          name: sub.name,
          type: 'SUB' as const,
          parent: 'reassembly',
          baugruppentypId: sub.baugruppentypId,
          processingTime: 45, // Default 45 minutes
          stochasticVariation: 0.25,
          currentOrders: []
        }));
        
        setStations([...mainStations, ...demontageSubStations, ...reassemblySubStations]);
        
        // Convert existing active orders to simulation format and assign to Auftragsannahme
        const activeOrders = result.data.orders.filter((order: any) => 
          order.phase !== 'AUFTRAGSABSCHLUSS'
        );
        
        const simulationOrders: SimulationOrder[] = activeOrders.map((order: any) => {
          const requiredBgt = extractRequiredBaugruppentypen(order);
          const processSeq = determineProcessSequence(order, [...mainStations, ...demontageSubStations, ...reassemblySubStations], requiredBgt);
          
          return {
            id: order.id,
            kundeId: order.kundeId,
            kundeName: `${order.kunde.vorname} ${order.kunde.nachname}`,
            produktvariante: order.produktvariante.bezeichnung,
            currentStation: 'order-acceptance', // All active orders start at Auftragsannahme
            progress: 0,
            startTime: new Date(order.createdAt),
            stationStartTime: new Date(),
            processSequence: processSeq,
            requiredBaugruppentypen: requiredBgt,
            stationDurations: {}
          };
        });
        
        setOrders(simulationOrders);
        
        // Create flow diagram
        createFlowDiagram(mainStations, demontageSubStations, reassemblySubStations);
      } else {
        toast.error(result.error || 'Fehler beim Laden der Simulationsdaten');
      }
    } catch (error) {
      console.error('Error loading simulation data:', error);
      toast.error('Fehler beim Laden der Simulationsdaten');
    } finally {
      setLoading(false);
    }
  };

  const determineProcessSequence = (order: any, allStations: SimulationStation[], requiredBgt: string[]): string[] => {
    const sequence = ['order-acceptance', 'inspection'];
    
    // Add demontage stations based on required Baugruppentypen
    requiredBgt.forEach(bgt => {
      const station = allStations.find(s => 
        s.type === 'SUB' && 
        s.parent === 'demontage' && 
        (s.name.includes(bgt) || s.name.includes(bgt.replace('BGT-PS-', '').replace('BGT-', '')))
      );
      if (station) {
        sequence.push(station.id);
      }
    });
    
    // Add reassembly stations
    requiredBgt.forEach(bgt => {
      const station = allStations.find(s => 
        s.type === 'SUB' && 
        s.parent === 'reassembly' && 
        (s.name.includes(bgt) || s.name.includes(bgt.replace('BGT-PS-', '').replace('BGT-', '')))
      );
      if (station) {
        sequence.push(station.id);
      }
    });
    
    sequence.push('quality', 'shipping');
    return sequence;
  };

  const extractRequiredBaugruppentypen = (order: any): string[] => {
    const bgtSet = new Set<string>();
    order.baugruppenInstances?.forEach((instance: any) => {
      if (instance.baugruppe?.baugruppentyp?.bezeichnung) {
        bgtSet.add(instance.baugruppe.baugruppentyp.bezeichnung);
      }
    });
    return Array.from(bgtSet);
  };

  const createFlowDiagram = (
    mainStations: SimulationStation[], 
    demontageSubStations: SimulationStation[], 
    reassemblySubStations: SimulationStation[]
  ) => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    
    // Calculate dynamic heights based on number of sub-stations
    const demontageHeight = Math.max(300, 80 + demontageSubStations.length * 60 + 40);
    const reassemblyHeight = Math.max(300, 80 + reassemblySubStations.length * 60 + 40);
    
    // Main stations as horizontal flow
    mainStations.forEach((station, index) => {
      const isParent = station.id === 'demontage' || station.id === 'reassembly';
      const isDemontage = station.id === 'demontage';
      const isReassembly = station.id === 'reassembly';
      
      let dynamicHeight = 80;
      let title = station.name;
      
      if (isDemontage) {
        dynamicHeight = demontageHeight;
        title = `${station.name} (${demontageSubStations.length} Baugruppentypen)`;
      } else if (isReassembly) {
        dynamicHeight = reassemblyHeight;
        title = `${station.name} (${reassemblySubStations.length} Baugruppentypen)`;
      }
      
      flowNodes.push({
        id: station.id,
        type: isParent ? 'group' : 'default',
        position: { x: index * 250, y: 100 },
        data: { 
          label: (
            <div className="text-center">
              <div className="font-bold">{title}</div>
              {!isParent && (
                <>
                  <div className="text-xs text-gray-500">Zeit: {station.processingTime} min (±{Math.round(station.stochasticVariation * 100)}%)</div>
                  <div className="text-xs text-blue-500">Aufträge: {station.currentOrders.length}</div>
                </>
              )}
            </div>
          )
        },
        style: {
          background: isParent ? '#f0f0f0' : '#ffffff',
          border: '2px solid #1e40af',
          borderRadius: '8px',
          padding: isParent ? '20px' : '10px',
          width: isParent ? 220 : 180,
          height: dynamicHeight
        }
      });
      
      // Add edges between main stations
      if (index > 0 && !isParent) {
        const prevStation = mainStations[index - 1];
        if (!prevStation.id.includes('demontage') && !prevStation.id.includes('reassembly')) {
          flowEdges.push({
            id: `${mainStations[index - 1].id}-${station.id}`,
            source: mainStations[index - 1].id,
            target: station.id,
            type: 'smoothstep'
          });
        }
      }
    });
    
    // Add sub-stations for Demontage
    demontageSubStations.forEach((subStation, index) => {
      flowNodes.push({
        id: subStation.id,
        type: 'default',
        position: { x: 20, y: 40 + index * 60 },
        parentId: 'demontage',
        data: {
          label: (
            <div className="text-center">
              <div className="text-xs font-semibold">{subStation.name.replace('Demontage ', '')}</div>
              <div className="text-xs text-gray-500">{subStation.processingTime} min (±{Math.round(subStation.stochasticVariation * 100)}%)</div>
              <div className="text-xs text-blue-500">Aufträge: {subStation.currentOrders.length}</div>
            </div>
          )
        },
        style: {
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          padding: '5px',
          width: 180,
          height: 60
        }
      });
    });
    
    // Add sub-stations for Re-Assembly
    reassemblySubStations.forEach((subStation, index) => {
      flowNodes.push({
        id: subStation.id,
        type: 'default',
        position: { x: 20, y: 40 + index * 60 },
        parentId: 'reassembly',
        data: {
          label: (
            <div className="text-center">
              <div className="text-xs font-semibold">{subStation.name.replace('Montage ', '')}</div>
              <div className="text-xs text-gray-500">{subStation.processingTime} min (±{Math.round(subStation.stochasticVariation * 100)}%)</div>
              <div className="text-xs text-blue-500">Aufträge: {subStation.currentOrders.length}</div>
            </div>
          )
        },
        style: {
          background: '#d4edda',
          border: '1px solid #28a745',
          borderRadius: '4px',
          padding: '5px',
          width: 180,
          height: 60
        }
      });
    });
    
    // Connect inspection to demontage and quality to shipping
    flowEdges.push(
      { id: 'inspection-demontage', source: 'inspection', target: 'demontage', type: 'smoothstep' },
      { id: 'demontage-reassembly', source: 'demontage', target: 'reassembly', type: 'smoothstep' },
      { id: 'reassembly-quality', source: 'reassembly', target: 'quality', type: 'smoothstep' },
      { id: 'quality-shipping', source: 'quality', target: 'shipping', type: 'smoothstep' }
    );
    
    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  // Simulation engine
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const realTimeDelta = now - lastRealTime;
      const simulationTimeDelta = realTimeDelta * speed;
      
      setSimulationTime(prev => new Date(prev.getTime() + simulationTimeDelta));
      setLastRealTime(now);
      
      // Process orders through stations
      processOrders(simulationTimeDelta / 60000); // Convert to minutes
    }, 100); // Update every 100ms
    
    return () => clearInterval(interval);
  }, [isRunning, speed, lastRealTime]);

  const calculateStochasticProcessingTime = (baseTime: number, variation: number): number => {
    // Apply stochastic variation using normal distribution approximation
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    const variationAmount = baseTime * variation * randomFactor;
    return Math.max(1, baseTime + variationAmount); // Minimum 1 minute
  };

  const saveStationDuration = async (orderId: string, stationId: string, stationName: string, stationType: string, expectedDuration: number, actualDuration: number, startTime: Date, endTime: Date) => {
    try {
      await fetch('/api/station-duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auftragId: orderId,
          stationId,
          stationName,
          stationType,
          expectedDuration,
          actualDuration,
          stochasticVariation: (actualDuration - expectedDuration) / expectedDuration,
          startedAt: startTime.toISOString(),
          completedAt: endTime.toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving station duration:', error);
    }
  };

  const processOrders = (deltaMinutes: number) => {
    setOrders(prevOrders => {
      const updatedOrders = [...prevOrders];
      const newCompletedOrders: SimulationOrder[] = [];
      
      updatedOrders.forEach(order => {
        const currentStationData = stations.find(s => s.id === order.currentStation);
        
        if (currentStationData) {
          // Initialize station duration tracking if not already done
          if (!order.stationDurations[order.currentStation]) {
            const stochasticTime = calculateStochasticProcessingTime(
              currentStationData.processingTime, 
              currentStationData.stochasticVariation
            );
            order.stationDurations[order.currentStation] = {
              expected: currentStationData.processingTime,
              actual: stochasticTime,
              startTime: new Date()
            };
            order.stationStartTime = new Date();
            order.progress = 0;
          }
          
          order.progress += deltaMinutes;
          const requiredTime = order.stationDurations[order.currentStation].actual || currentStationData.processingTime;
          
          if (order.progress >= requiredTime) {
            // Save station duration to database
            const stationDuration = order.stationDurations[order.currentStation];
            if (stationDuration.startTime) {
              saveStationDuration(
                order.id,
                order.currentStation,
                currentStationData.name,
                currentStationData.type,
                stationDuration.expected,
                stationDuration.actual || requiredTime,
                stationDuration.startTime,
                new Date()
              );
            }
            
            // Move to next station
            const currentIndex = order.processSequence.indexOf(order.currentStation);
            if (currentIndex < order.processSequence.length - 1) {
              order.currentStation = order.processSequence[currentIndex + 1];
              order.progress = 0;
              // Don't initialize next station duration here - will be done in next iteration
            } else {
              // Order completed
              newCompletedOrders.push(order);
            }
          }
        }
      });
      
      // Remove completed orders
      const remainingOrders = updatedOrders.filter(o => !newCompletedOrders.some(co => co.id === o.id));
      
      if (newCompletedOrders.length > 0) {
        setCompletedOrders(prev => [...prev, ...newCompletedOrders]);
      }
      
      return remainingOrders;
    });
    
    // Update station current orders
    updateStationOrders();
  };

  const updateStationOrders = () => {
    setStations(prevStations => {
      const updatedStations = [...prevStations];
      updatedStations.forEach(station => {
        station.currentOrders = orders.filter(o => o.currentStation === station.id);
      });
      return updatedStations;
    });
    
    // Update flow diagram
    updateFlowDiagram();
  };

  const updateFlowDiagram = () => {
    setNodes(prevNodes => 
      prevNodes.map(node => {
        const station = stations.find(s => s.id === node.id);
        if (station) {
          const isParent = station.id === 'demontage' || station.id === 'reassembly';
          const isDemontage = station.id === 'demontage';
          const isReassembly = station.id === 'reassembly';
          const isSub = station.type === 'SUB';
          
          let title = station.name;
          if (isDemontage) {
            const demontageCount = stations.filter(s => s.type === 'SUB' && s.parent === 'demontage').length;
            title = `${station.name} (${demontageCount} Baugruppentypen)`;
          } else if (isReassembly) {
            const reassemblyCount = stations.filter(s => s.type === 'SUB' && s.parent === 'reassembly').length;
            title = `${station.name} (${reassemblyCount} Baugruppentypen)`;
          }
          
          return {
            ...node,
            data: {
              label: (
                <div className="text-center">
                  <div className={isSub ? "text-xs font-semibold" : "font-bold"}>
                    {isSub ? title.replace('Demontage ', '').replace('Montage ', '') : title}
                  </div>
                  {!isParent && (
                    <>
                      <div className="text-xs text-gray-500">
                        {station.processingTime} min (±{Math.round(station.stochasticVariation * 100)}%)
                      </div>
                      <div className="text-xs text-blue-500">Aufträge: {station.currentOrders.length}</div>
                    </>
                  )}
                </div>
              )
            }
          };
        }
        return node;
      })
    );
  };

  const handleStationClick = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (station) {
      setSelectedStation(station);
      setTempProcessingTime(station.processingTime);
      setStationDialogOpen(true);
    }
  };

  const handleSaveStationTime = () => {
    if (selectedStation) {
      setStations(prev => 
        prev.map(s => 
          s.id === selectedStation.id 
            ? { ...s, processingTime: tempProcessingTime }
            : s
        )
      );
      toast.success(`Bearbeitungszeit für ${selectedStation.name} aktualisiert`);
      setStationDialogOpen(false);
    }
  };

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Simulationsdaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Simulationssteuerung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant={isRunning ? "destructive" : "default"}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => {
                  setIsRunning(false);
                  setOrders([]);
                  setCompletedOrders([]);
                  setSimulationTime(new Date());
                }}
                variant="outline"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
              
              <Button
                onClick={loadSimulationData}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Neu laden
              </Button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Label>Geschwindigkeit:</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[speed]}
                    onValueChange={handleSpeedChange}
                    min={1}
                    max={100}
                    step={1}
                    className="w-32"
                  />
                  <span className="text-sm font-medium w-12">{speed}x</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm">
                  {simulationTime.toLocaleString('de-DE')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">Aktive Aufträge</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">Abgeschlossene Aufträge</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stations.length}</div>
            <p className="text-xs text-muted-foreground">Stationen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {stations.reduce((sum, s) => sum + s.currentOrders.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Aufträge in Bearbeitung</p>
          </CardContent>
        </Card>
      </div>

      {/* Process Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Prozessfluss</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: 400 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_, node) => handleStationClick(node.id)}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Active Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Aktive Aufträge - Prozesszeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Keine aktiven Aufträge</p>
            ) : (
              <>
                {/* Summary Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Kunde</TableHead>
                        <TableHead className="w-[200px]">Produktvariante</TableHead>
                        <TableHead className="w-[150px]">Aktuelle Station</TableHead>
                        <TableHead className="w-[120px]">Fortschritt</TableHead>
                        <TableHead className="w-[100px]">Verzögerung</TableHead>
                        <TableHead className="w-[100px]">Gesamtzeit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => {
                        const currentStationData = stations.find(s => s.id === order.currentStation);
                        const currentStationDuration = order.stationDurations[order.currentStation];
                        const progressPercent = (order.progress / (currentStationDuration?.actual || currentStationData?.processingTime || 1)) * 100;
                        
                        // Calculate total delay across all completed stations
                        const completedStations = Object.entries(order.stationDurations).filter(([stationId, duration]) => {
                          return duration.actual && order.processSequence.indexOf(order.currentStation) > order.processSequence.indexOf(stationId);
                        });
                        const totalDelay = completedStations.reduce((acc, [, duration]) => {
                          return acc + (duration.actual! - duration.expected);
                        }, 0);
                        
                        // Calculate total time spent so far
                        const totalTimeSpent = completedStations.reduce((acc, [, duration]) => acc + duration.actual!, 0) + order.progress;
                        
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.kundeName}</TableCell>
                            <TableCell>{order.produktvariante}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {currentStationData?.name || 'Unbekannt'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium">{progressPercent.toFixed(0)}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs font-medium ${
                                totalDelay > 0 ? 'text-red-600' : totalDelay < 0 ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {totalDelay > 0 ? '+' : ''}{totalDelay.toFixed(1)} min
                              </span>
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              {totalTimeSpent.toFixed(1)} min
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Detailed Order Cards */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Detaillierte Auftragsansicht</h3>
                  {orders.map((order) => {
                const currentStationData = stations.find(s => s.id === order.currentStation);
                const currentStationDuration = order.stationDurations[order.currentStation];
                
                return (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    {/* Order Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{order.kundeName}</h4>
                        <p className="text-sm text-gray-600">{order.produktvariante}</p>
                        <p className="text-xs text-gray-500">Auftrag ID: {order.id}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          Aktuell: {currentStationData?.name || 'Unbekannt'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.progress.toFixed(1)} / {currentStationDuration?.actual?.toFixed(1) || currentStationData?.processingTime || 0} min
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, (order.progress / (currentStationDuration?.actual || currentStationData?.processingTime || 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Process Sequence */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Prozesssequenz:</h5>
                      <div className="flex flex-wrap gap-2">
                        {order.processSequence.map((stationId, index) => {
                          const stationData = stations.find(s => s.id === stationId);
                          const isCurrentStation = stationId === order.currentStation;
                          const isCompleted = order.processSequence.indexOf(order.currentStation) > index;
                          const stationDuration = order.stationDurations[stationId];
                          
                          return (
                            <div 
                              key={`${order.id}-${stationId}`}
                              className={`px-3 py-1 rounded-full text-xs border ${
                                isCurrentStation 
                                  ? 'bg-blue-100 border-blue-300 text-blue-800' 
                                  : isCompleted 
                                    ? 'bg-green-100 border-green-300 text-green-800'
                                    : 'bg-gray-100 border-gray-300 text-gray-600'
                              }`}
                            >
                              <div className="font-medium">{stationData?.name || stationId}</div>
                              {stationDuration && (
                                <div className="text-xs">
                                  {isCompleted 
                                    ? `✓ ${stationDuration.actual?.toFixed(1)}min` 
                                    : `${stationDuration.expected}min (±${Math.round((stationData?.stochasticVariation || 0) * 100)}%)`
                                  }
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Station Durations Details */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Stationszeiten:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(order.stationDurations).map(([stationId, duration]) => {
                          const stationData = stations.find(s => s.id === stationId);
                          const isCompleted = order.processSequence.indexOf(order.currentStation) > order.processSequence.indexOf(stationId);
                          
                          return (
                            <div 
                              key={`${order.id}-duration-${stationId}`}
                              className={`p-2 border rounded ${
                                isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="text-xs font-medium text-gray-700">
                                {stationData?.name || stationId}
                              </div>
                              <div className="text-xs space-y-1">
                                <div>Erwartet: {duration.expected} min</div>
                                <div>Tatsächlich: {duration.actual?.toFixed(1)} min</div>
                                {duration.actual && duration.expected && (
                                  <div className={`font-medium ${
                                    duration.actual > duration.expected ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {duration.actual > duration.expected ? '+' : ''}
                                    {(duration.actual - duration.expected).toFixed(1)} min
                                  </div>
                                )}
                                {duration.startTime && (
                                  <div className="text-gray-500">
                                    Start: {duration.startTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Required Baugruppentypen */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Benötigte Baugruppentypen:</h5>
                      <div className="flex flex-wrap gap-1">
                        {order.requiredBaugruppentypen.map((bgt, index) => (
                          <span 
                            key={`${order.id}-bgt-${index}`}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                          >
                            {bgt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
                  })}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Station Configuration Dialog */}
      <Dialog open={stationDialogOpen} onOpenChange={setStationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Station konfigurieren: {selectedStation?.name}</DialogTitle>
            <DialogDescription>
              Passen Sie die Bearbeitungszeit für diese Station an.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processing-time" className="text-right">
                Bearbeitungszeit (Minuten)
              </Label>
              <Input
                id="processing-time"
                type="number"
                value={tempProcessingTime}
                onChange={(e) => setTempProcessingTime(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveStationTime}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}