import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedFactorySimulation } from './AdvancedFactorySimulation';
import { AdvancedPhaseConfigModal } from './AdvancedPhaseConfigModal';
import { AdvancedStationConfigModal } from './AdvancedStationConfigModal';
import { AdvancedOrderDetailsModal } from './AdvancedOrderDetailsModal';
import { AdvancedKPIDashboard } from './AdvancedKPIDashboard';
import { AdvancedInventory } from './AdvancedInventory';
import { AdvancedScheduling } from './AdvancedScheduling';
import { AdvancedOrder, OrderPhase, ProductionStation, ComponentType, OrderWithDetails, PhaseConfig } from '@/types/advanced-factory';
import { generateRandomAdvancedOrder, initialAdvancedProductionStations } from '@/lib/advanced-factory-utils';
import { calculateAdvancedPhaseProcessingTime, calculateAdvancedPhaseProcessingTimeWithConfig, shouldRequireAdvancedQualityRework, advancedPhaseConfigs } from '@/lib/advanced-phase-config';
import { saveAdvancedOrderToDatabase, clearAllAdvancedOrderData, saveAdvancedOrderProcessStep, completeAdvancedOrderProcessStep } from '@/lib/advanced-order-service';
import { clearAdvancedProductionStepTimings } from '@/lib/advanced-production-step-service';
import { Package, Calendar, BarChart3, Settings } from 'lucide-react';

export function AdvancedFactoryManagement() {
  const [activeTab, setActiveTab] = useState('simulation');
  
  // Shared simulation state between tabs
  const [orders, setOrders] = useState<AdvancedOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<AdvancedOrder[]>([]);
  const [stations, setStations] = useState<ProductionStation[]>(initialAdvancedProductionStations);
  const [simulationStartTime] = useState(new Date());
  
  // Phase configurations - individual state for each phase with completely separate values
  const [phaseConfigState, setPhaseConfigState] = useState<Record<OrderPhase, PhaseConfig>>({
    ORDER_ACCEPTANCE: {
      name: 'Auftragseingang',
      baseProcessingTime: 5,
      stochasticVariation: 0.2,
      disruptionProbability: 0.05,
      disruptionDelayMin: 2,
      disruptionDelayMax: 10
    },
    INSPECTION: {
      name: 'Inspektion',
      baseProcessingTime: 15,
      stochasticVariation: 0.3,
      disruptionProbability: 0.1,
      disruptionDelayMin: 5,
      disruptionDelayMax: 20
    },
    DEMONTAGE: {
      name: 'Demontage',
      baseProcessingTime: 20,
      stochasticVariation: 0.25,
      disruptionProbability: 0.08,
      disruptionDelayMin: 5,
      disruptionDelayMax: 15
    },
    PRODUCTION: {
      name: 'Produktion',
      baseProcessingTime: 120,
      stochasticVariation: 0.25,
      disruptionProbability: 0.15,
      disruptionDelayMin: 10,
      disruptionDelayMax: 60
    },
    QUALITY_CHECK: {
      name: 'Qualitätsprüfung',
      baseProcessingTime: 20,
      stochasticVariation: 0.4,
      disruptionProbability: 0.12,
      disruptionDelayMin: 5,
      disruptionDelayMax: 30
    },
    SHIPPING: {
      name: 'Versand',
      baseProcessingTime: 10,
      stochasticVariation: 0.2,
      disruptionProbability: 0.08,
      disruptionDelayMin: 5,
      disruptionDelayMax: 25
    },
    COMPLETED: {
      name: 'Abgeschlossen',
      baseProcessingTime: 0,
      stochasticVariation: 0,
      disruptionProbability: 0,
      disruptionDelayMin: 0,
      disruptionDelayMax: 0
    }
  });

  // Modal states
  const [selectedPhase, setSelectedPhase] = useState<OrderPhase | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [selectedStation, setSelectedStation] = useState<ProductionStation | null>(null);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [currentSimulationTime, setCurrentSimulationTime] = useState(new Date());
  const [orderArrivalRate, setOrderArrivalRate] = useState(2); // minutes
  const [lastRealTime, setLastRealTime] = useState(Date.now());

  const handlePhaseClick = useCallback((phase: OrderPhase) => {
    setSelectedPhase(phase);
    setIsPhaseModalOpen(true);
  }, []);

  const handleStationClick = useCallback((station: ProductionStation) => {
    setSelectedStation(station);
    setIsStationModalOpen(true);
  }, []);

  const handlePhaseSave = useCallback((phase: OrderPhase, config: PhaseConfig) => {
    // Update local phase configuration state
    setPhaseConfigState(prev => ({
      ...prev,
      [phase]: { ...config }
    }));
    console.log('Phase configuration updated:', phase, config);
  }, []);

  const handleStationSave = useCallback((updatedStation: ProductionStation) => {
    setStations(prev => prev.map(station => 
      station.id === updatedStation.id ? updatedStation : station
    ));
    setIsStationModalOpen(false);
  }, []);

  const handleClearData = useCallback(async () => {
    setOrders([]);
    setCompletedOrders([]);
    setStations(initialAdvancedProductionStations);
    setCurrentSimulationTime(new Date());
    setLastRealTime(Date.now());
    
    // Clear database data
    await clearAllAdvancedOrderData();
    await clearAdvancedProductionStepTimings();
  }, []);

  const handleManualOrder = useCallback(() => {
    const newOrder = generateRandomAdvancedOrder();
    setOrders(prev => [...prev, newOrder]);
    saveAdvancedOrderToDatabase(newOrder);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-segoe">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold">Advanced Simulation</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="simulation" className="data-[state=active]:bg-white flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Simulation</span>
              </TabsTrigger>
              <TabsTrigger value="kpi" className="data-[state=active]:bg-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">KPI Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-white flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Lagerbestand</span>
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="data-[state=active]:bg-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Terminierung</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="simulation" className="mt-0">
            <AdvancedFactorySimulation 
              orders={orders}
              completedOrders={completedOrders}
              stations={stations}
              isRunning={isRunning}
              speed={speed}
              startDate={startDate}
              orderArrivalRate={orderArrivalRate}
              currentSimulationTime={currentSimulationTime}
              onStart={() => setIsRunning(true)}
              onPause={() => setIsRunning(false)}
              onStop={() => {
                setIsRunning(false);
                handleClearData();
              }}
              onSpeedChange={setSpeed}
              onDateChange={setStartDate}
              onOrderArrivalRateChange={setOrderArrivalRate}
              onManualOrder={handleManualOrder}
              onClearData={handleClearData}
              onStationClick={handleStationClick}
              onPhaseClick={handlePhaseClick}
              onOrderClick={async (order: AdvancedOrder) => {
                // Convert to OrderWithDetails format
                const orderWithDetails: OrderWithDetails = {
                  order: {
                    id: order.id,
                    customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
                    order_number: order.displayId || order.id,
                    current_phase: order.phase,
                    status: order.phase === 'COMPLETED' ? 'completed' : 'active',
                    delivery_date: order.deliveryDate.toISOString(),
                    total_processing_time: 0,
                    completed_at: order.phase === 'COMPLETED' ? new Date().toISOString() : undefined,
                    created_at: order.createdAt.toISOString(),
                    updated_at: new Date().toISOString(),
                    reassembly_reason: order.components.some(c => c.reAssemblyType === 'PFLICHT') ? 'Damage detected' : undefined,
                    requires_reassembly: order.components.some(c => c.reAssemblyType),
                  },
                  processSteps: order.phaseHistory.map((phase, index) => ({
                    id: `${order.id}-phase-${index}`,
                    order_id: order.id,
                    phase: phase.phase,
                    started_at: phase.timestamp.toISOString(),
                    completed_at: index < order.phaseHistory.length - 1 ? order.phaseHistory[index + 1].timestamp.toISOString() : undefined,
                    duration_minutes: phase.duration,
                    was_rework: phase.wasRework || false,
                    disruption_occurred: false,
                    disruption_delay_minutes: 0,
                  })),
                  components: order.components.map(c => ({
                    id: `${order.id}-component-${c.componentId}`,
                    order_id: order.id,
                    component_type: c.componentId,
                    condition_percentage: c.condition,
                    reassembly_type: c.reAssemblyType,
                    replacement_component_id: c.replacementComponentId,
                  })),
                  productionStepTimings: [],
                  demontageStepTimings: [],
                };
                setSelectedOrder(orderWithDetails);
              }}
              onStationSave={handleStationSave}
            />
          </TabsContent>
          
          <TabsContent value="kpi" className="mt-0">
            <AdvancedKPIDashboard 
              orders={orders}
              completedOrders={completedOrders}
              stations={stations}
              simulationStartTime={simulationStartTime}
              onClearData={handleClearData}
            />
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-0">
            <AdvancedInventory />
          </TabsContent>
          
          <TabsContent value="scheduling" className="mt-0">
            <AdvancedScheduling />
          </TabsContent>
        </Tabs>

        {/* Configuration Modals */}
        <AdvancedPhaseConfigModal
          phase={selectedPhase}
          isOpen={isPhaseModalOpen}
          onClose={() => setIsPhaseModalOpen(false)}
          onSave={handlePhaseSave}
          currentConfig={selectedPhase ? phaseConfigState[selectedPhase] : null}
        />

        <AdvancedStationConfigModal
          station={selectedStation}
          isOpen={isStationModalOpen}
          onClose={() => setIsStationModalOpen(false)}
          onSave={handleStationSave}
        />

        {selectedOrder && (
          <AdvancedOrderDetailsModal
            orderData={selectedOrder}
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
}