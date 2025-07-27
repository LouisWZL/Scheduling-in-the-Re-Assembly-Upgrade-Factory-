'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { useView } from '@/contexts/view-context'
import * as joint from '@joint/plus'

interface Baugruppentyp {
  id: string
  bezeichnung: string
  beschreibung?: string | null
}

interface ConfiguratorSidebarRightProps {
  factoryId: string
}

export function ConfiguratorSidebarRight({ factoryId }: ConfiguratorSidebarRightProps) {
  const { currentView } = useView()
  const stencilRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<joint.dia.Graph | null>(null)
  const paperRef = useRef<joint.dia.Paper | null>(null)
  const [baugruppentypen, setBaugruppentypen] = useState<Baugruppentyp[]>([])

  // Fetch Baugruppentypen when factory changes
  useEffect(() => {
    const fetchBaugruppentypen = async () => {
      try {
        const response = await fetch('/api/factories')
        const data = await response.json()
        
        if (!Array.isArray(data)) {
          console.error('Invalid response format:', data)
          return
        }
        
        const factory = data.find((f: any) => f.id === factoryId)
        
        if (factory) {
          const baugruppentypMap = new Map<string, Baugruppentyp>()
          
          factory.produkte.forEach((produkt: any) => {
            produkt.baugruppentypen.forEach((typ: Baugruppentyp) => {
              baugruppentypMap.set(typ.id, typ)
            })
          })
          
          setBaugruppentypen(Array.from(baugruppentypMap.values()))
        }
      } catch (error) {
        console.error('Error fetching factory data:', error)
      }
    }

    if (factoryId) {
      fetchBaugruppentypen()
    }
  }, [factoryId])

  useEffect(() => {
    if (currentView !== 'produkt' || !stencilRef.current || baugruppentypen.length === 0) {
      // Clean up if not in produkt view or no baugruppentypen
      if (paperRef.current) {
        paperRef.current.remove()
        paperRef.current = null
      }
      if (graphRef.current) {
        graphRef.current.clear()
        graphRef.current = null
      }
      return
    }

    // Create a graph for the stencil shapes
    const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes })
    graphRef.current = graph

    // Create a paper for the stencil
    const paper = new joint.dia.Paper({
      el: stencilRef.current,
      model: graph,
      width: 280,
      height: 600,
      cellViewNamespace: joint.shapes,
      background: {
        color: '#f9fafb'
      },
      interactive: {
        elementMove: false,
        linkMove: false,
        arrowheadMove: false
      },
      preventDefaultBlankAction: false,
      preventContextMenu: false
    })
    paperRef.current = paper

    // Create shapes for each Baugruppentyp
    const shapes = []
    const colors = [
      { fill: '#6366f1', stroke: '#4f46e5' }, // Indigo
      { fill: '#10b981', stroke: '#059669' }, // Emerald
      { fill: '#f59e0b', stroke: '#d97706' }, // Amber
      { fill: '#ef4444', stroke: '#dc2626' }, // Red
      { fill: '#8b5cf6', stroke: '#7c3aed' }, // Violet
      { fill: '#14b8a6', stroke: '#0d9488' }, // Teal
    ]

    baugruppentypen.forEach((typ, index) => {
      const colorIndex = index % colors.length
      const color = colors[colorIndex]
      
      // Calculate position in a 2-column layout
      const col = index % 2
      const row = Math.floor(index / 2)
      const x = 20 + (col * 140)
      const y = 20 + (row * 100)
      
      const shape = new joint.shapes.standard.Rectangle({
        position: { x, y },
        size: { width: 120, height: 80 },
        attrs: {
          body: {
            fill: color.fill,
            stroke: color.stroke,
            strokeWidth: 2,
            rx: 8,
            ry: 8,
            cursor: 'move'
          },
          label: {
            text: typ.bezeichnung,
            fill: 'white',
            fontSize: 14,
            fontWeight: '600',
            cursor: 'move',
            textWrap: {
              width: 110,
              height: 70,
              ellipsis: true
            }
          }
        }
      })
      
      // Store baugruppentyp data on the shape for later use
      shape.set('baugruppentyp', typ)
      
      shapes.push(shape)
    })

    // Add shapes to the graph
    graph.addCells(shapes)

    // Set up drag functionality
    paper.on('cell:pointerdown', (cellView: joint.dia.CellView, evt: any, x: number, y: number) => {
      const mainPaper = (window as any).mainJointPaper
      if (!mainPaper) return

      const cell = cellView.model
      const clone = cell.clone()

      // Copy the baugruppentyp data to the clone
      if (cell.get('baugruppentyp')) {
        clone.set('baugruppentyp', cell.get('baugruppentyp'))
      }
      
      // Add clone to main paper at mouse position
      const localPoint = mainPaper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY })
      clone.position(localPoint.x - 50, localPoint.y - 40)
      mainPaper.model.addCell(clone)

      // Create a pointer move handler
      const onMouseMove = (moveEvt: MouseEvent) => {
        const movePoint = mainPaper.clientToLocalPoint({ x: moveEvt.clientX, y: moveEvt.clientY })
        clone.position(movePoint.x - 50, movePoint.y - 40)
      }

      // Create a pointer up handler
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      // Attach event listeners
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })

    // Cleanup
    return () => {
      if (paperRef.current) {
        paperRef.current.remove()
        paperRef.current = null
      }
      if (graphRef.current) {
        graphRef.current.clear()
        graphRef.current = null
      }
    }
  }, [currentView, baugruppentypen])

  if (currentView !== 'produkt') {
    return (
      <Sidebar 
        side="right" 
        collapsible="none"
        className="sticky top-0 hidden h-svh border-l lg:flex"
        style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
      >
        <SidebarHeader className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Details</h2>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 text-sm text-muted-foreground">
            <p>Weitere Details und Optionen werden hier angezeigt.</p>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar 
      side="right" 
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
    >
      <SidebarHeader className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Komponenten</h2>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <div className="p-2 bg-gray-50 text-xs text-muted-foreground">
          <p className="text-center">Shapes zum Paper ziehen</p>
        </div>
        <div 
          ref={stencilRef} 
          className="h-full w-full overflow-auto"
          style={{ minHeight: '600px' }}
        />
      </SidebarContent>
    </Sidebar>
  )
}