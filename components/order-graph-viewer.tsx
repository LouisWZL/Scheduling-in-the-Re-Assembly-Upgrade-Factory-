'use client'

import { useEffect, useRef, useState } from 'react'
import * as joint from '@joint/plus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { UpgradeTyp } from '@prisma/client'

// Import JointJS CSS - IMPORTANT!
import '@joint/plus/joint-plus.css'

interface BaugruppeDetail {
  id: string
  bezeichnung: string
  artikelnummer: string
  variantenTyp: string
  zustand: number
  upgradeTyp?: UpgradeTyp | null
}

interface OrderGraphViewerProps {
  order: {
    id: string
    produktvariante: {
      bezeichnung: string
      typ: string
    }
    graphData?: any
    baugruppenInstances?: Array<{
      id: string
      zustand: number
      upgradeTyp?: UpgradeTyp | null
      baugruppe: {
        id: string
        bezeichnung: string
        artikelnummer: string
        variantenTyp: string
      }
    }>
  } | null
}

export function OrderGraphViewer({ order }: OrderGraphViewerProps) {
  const paperRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<joint.dia.Graph | null>(null)
  const paperInstanceRef = useRef<joint.dia.Paper | null>(null)
  const paperScrollerRef = useRef<joint.ui.PaperScroller | null>(null)
  const [selectedBaugruppe, setSelectedBaugruppe] = useState<BaugruppeDetail | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!paperRef.current) return

    console.log('OrderGraphViewer - Order changed:', order?.id, 'Has graphData:', !!order?.graphData)

    // Clean up previous instances
    if (paperScrollerRef.current) {
      paperScrollerRef.current.remove()
      paperScrollerRef.current = null
    }
    if (paperInstanceRef.current) {
      paperInstanceRef.current.remove()
      paperInstanceRef.current = null
    }
    if (graphRef.current) {
      graphRef.current.clear()
      graphRef.current = null
    }

    if (!order?.graphData?.cells) {
      return
    }

    // Create Graph
    const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes })
    graphRef.current = graph

    // Create Paper with proper configuration
    const paper = new joint.dia.Paper({
      width: 1000,
      height: 600,
      model: graph,
      cellViewNamespace: joint.shapes,
      background: {
        color: '#f8f9fa'
      },
      gridSize: 20,
      drawGrid: {
        name: 'doubleMesh',
        args: [
          { color: '#e5e5e5', thickness: 1 }, // minor grid
          { color: '#d0d0d0', thickness: 1, scaleFactor: 5 } // major grid
        ]
      },
      interactive: { 
        elementMove: false, // Prevent moving elements
        linkMove: false,    // Prevent moving links
        labelMove: false    // Prevent moving labels
      },
      async: true,
      frozen: true,
      sorting: joint.dia.Paper.sorting.APPROX
    })
    paperInstanceRef.current = paper

    // Create PaperScroller for better navigation
    const paperScroller = new joint.ui.PaperScroller({
      paper: paper,
      autoResizePaper: true,
      padding: 50,
      cursor: 'default',
      baseWidth: paperRef.current.clientWidth || 800,
      baseHeight: 400,
      contentOptions: {
        padding: 50,
        allowNewOrigin: 'any',
        useModelGeometry: true
      }
    })
    paperScrollerRef.current = paperScroller

    // Append to DOM
    paperRef.current.appendChild(paperScroller.el)
    paperScroller.render()

    // Center the paper
    paperScroller.center()

    // Load graph data
    try {
      console.log('Loading graph with cells:', order.graphData.cells.length)
      graph.fromJSON(order.graphData)
      
      // Unfreeze to see the graph
      paper.unfreeze()
      
      // Use zoomToFit after content is loaded
      setTimeout(() => {
        paperScroller.zoomToFit({
          minScale: 0.2,
          maxScale: 2,
          padding: 50
        })
      }, 100)
    } catch (error) {
      console.error('Error loading graph:', error)
    }

    // Create baugruppe map for quick lookup
    const baugruppeMap = new Map<string, BaugruppeDetail>()
    order.baugruppenInstances?.forEach(instance => {
      baugruppeMap.set(instance.baugruppe.id, {
        id: instance.baugruppe.id,
        bezeichnung: instance.baugruppe.bezeichnung,
        artikelnummer: instance.baugruppe.artikelnummer,
        variantenTyp: instance.baugruppe.variantenTyp,
        zustand: instance.zustand,
        upgradeTyp: instance.upgradeTyp
      })
    })

    // Add panning functionality like in factory-configurator
    paper.on('blank:pointerdown', (evt: any) => {
      paperScroller.startPanning(evt)
    })

    // Add click handler for elements
    paper.on('element:pointerclick', (elementView: joint.dia.ElementView) => {
      const element = elementView.model
      const cellData = element.toJSON()
      
      // Check if this is a baugruppe element
      if (cellData.baugruppe) {
        const baugruppeDetail = baugruppeMap.get(cellData.baugruppe.id)
        if (baugruppeDetail) {
          setSelectedBaugruppe(baugruppeDetail)
          setDialogOpen(true)
        }
      }
    })

    // Update element colors based on zustand and remove move cursor
    graph.getElements().forEach(element => {
      const cellData = element.toJSON()
      if (cellData.baugruppe) {
        const instance = order.baugruppenInstances?.find(
          bi => bi.baugruppe.id === cellData.baugruppe.id
        )
        if (instance) {
          // Color based on zustand (0-100)
          let color = '#10b981' // green for good condition
          if (instance.zustand < 30) {
            color = '#ef4444' // red for bad condition
          } else if (instance.zustand < 60) {
            color = '#f59e0b' // amber for medium condition
          }
          
          element.attr('body/fill', color)
          element.attr('body/fillOpacity', 0.3)
          element.attr('body/stroke', color)
          element.attr('body/strokeWidth', 2)
          element.attr('body/cursor', 'pointer') // Use pointer cursor instead of move
        }
      }
    })

    return () => {
      if (paperScrollerRef.current) {
        paperScrollerRef.current.remove()
      }
      if (paperInstanceRef.current) {
        paperInstanceRef.current.remove()
      }
      if (graphRef.current) {
        graphRef.current.clear()
      }
    }
  }, [order?.id])

  if (!order) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Wählen Sie einen Auftrag aus der Auftragsübersicht aus
      </div>
    )
  }

  const getZustandLabel = (zustand: number) => {
    if (zustand >= 80) return 'Sehr gut'
    if (zustand >= 60) return 'Gut'
    if (zustand >= 40) return 'Mittel'
    if (zustand >= 20) return 'Schlecht'
    return 'Sehr schlecht'
  }

  const getZustandColor = (zustand: number) => {
    if (zustand >= 80) return 'text-green-600'
    if (zustand >= 60) return 'text-emerald-600'
    if (zustand >= 40) return 'text-amber-600'
    if (zustand >= 20) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Montageprozess-Graph</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal text-muted-foreground">
                {order.produktvariante.bezeichnung}
              </span>
              <Badge variant={order.produktvariante.typ === 'premium' ? 'default' : 'secondary'}>
                {order.produktvariante.typ}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 opacity-30 border-2 border-red-500 rounded"></div>
                <span>Schlechter Zustand (&lt;30)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 opacity-30 border-2 border-amber-500 rounded"></div>
                <span>Mittlerer Zustand (30-60)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 opacity-30 border-2 border-green-500 rounded"></div>
                <span>Guter Zustand (&gt;60)</span>
              </div>
            </div>

            {/* Graph Container */}
            <div 
              ref={paperRef} 
              className="border rounded-lg bg-muted/20 relative"
              style={{ height: '400px', width: '100%', overflow: 'hidden' }}
            />

            {/* Instructions */}
            <p className="text-sm text-muted-foreground">
              Klicken Sie auf eine Baugruppe im Graph, um Details anzuzeigen
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Baugruppe Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby="baugruppe-details-description">
          <DialogHeader>
            <DialogTitle>{selectedBaugruppe?.bezeichnung}</DialogTitle>
          </DialogHeader>
          <div id="baugruppe-details-description" className="sr-only">
            Details zur ausgewählten Baugruppe
          </div>
          {selectedBaugruppe && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Artikelnummer</Label>
                  <p className="font-mono text-sm">{selectedBaugruppe.artikelnummer}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Varianten-Typ</Label>
                  <Badge variant="outline">{selectedBaugruppe.variantenTyp}</Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Zustand</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        selectedBaugruppe.zustand >= 60 ? 'bg-green-500' :
                        selectedBaugruppe.zustand >= 30 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedBaugruppe.zustand}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getZustandColor(selectedBaugruppe.zustand)}`}>
                    {selectedBaugruppe.zustand}% - {getZustandLabel(selectedBaugruppe.zustand)}
                  </span>
                </div>
              </div>

              {selectedBaugruppe.upgradeTyp && (
                <div>
                  <Label className="text-muted-foreground">Upgrade-Typ</Label>
                  <Badge 
                    variant={selectedBaugruppe.upgradeTyp === UpgradeTyp.PFLICHT ? 'destructive' : 'default'}
                    className="mt-1"
                  >
                    {selectedBaugruppe.upgradeTyp}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}