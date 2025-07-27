'use client'

import { useEffect, useRef } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { useView } from '@/contexts/view-context'
import * as joint from '@joint/plus'

export function ConfiguratorSidebarRight() {
  const { currentView } = useView()
  const stencilRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<joint.dia.Graph | null>(null)
  const paperRef = useRef<joint.dia.Paper | null>(null)

  useEffect(() => {
    if (currentView !== 'produkt' || !stencilRef.current) {
      // Clean up if not in produkt view
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

    // Create 5 different shapes
    const shapes = []

    // 1. Rectangle - Baugruppe
    const rect = new joint.shapes.standard.Rectangle({
      position: { x: 20, y: 20 },
      size: { width: 120, height: 80 },
      attrs: {
        body: {
          fill: '#6366f1',
          stroke: '#4f46e5',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
          cursor: 'move'
        },
        label: {
          text: 'Baugruppe',
          fill: 'white',
          fontSize: 14,
          fontWeight: '600',
          cursor: 'move'
        }
      }
    })
    shapes.push(rect)

    // 2. Circle - Prozess
    const circle = new joint.shapes.standard.Ellipse({
      position: { x: 160, y: 20 },
      size: { width: 80, height: 80 },
      attrs: {
        body: {
          fill: '#10b981',
          stroke: '#059669',
          strokeWidth: 2,
          cursor: 'move'
        },
        label: {
          text: 'Prozess',
          fill: 'white',
          fontSize: 14,
          fontWeight: '600',
          cursor: 'move'
        }
      }
    })
    shapes.push(circle)

    // 3. Diamond - Entscheidung
    const diamond = new joint.shapes.standard.Path({
      position: { x: 20, y: 120 },
      size: { width: 100, height: 100 },
      attrs: {
        body: {
          fill: '#f59e0b',
          stroke: '#d97706',
          strokeWidth: 2,
          d: 'M 50 0 L 100 50 L 50 100 L 0 50 Z',
          cursor: 'move'
        },
        label: {
          text: 'Entscheidung',
          fill: 'white',
          fontSize: 13,
          fontWeight: '600',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: '50%',
          y: '50%',
          cursor: 'move'
        }
      }
    })
    shapes.push(diamond)

    // 4. Hexagon - Station
    const hexagon = new joint.shapes.standard.Path({
      position: { x: 140, y: 120 },
      size: { width: 100, height: 86 },
      attrs: {
        body: {
          fill: '#ef4444',
          stroke: '#dc2626',
          strokeWidth: 2,
          d: 'M 25 0 L 75 0 L 100 43 L 75 86 L 25 86 L 0 43 Z',
          cursor: 'move'
        },
        label: {
          text: 'Station',
          fill: 'white',
          fontSize: 14,
          fontWeight: '600',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          x: '50%',
          y: '50%',
          cursor: 'move'
        }
      }
    })
    shapes.push(hexagon)

    // 5. Rounded Rectangle - Lager
    const roundedRect = new joint.shapes.standard.Rectangle({
      position: { x: 20, y: 240 },
      size: { width: 120, height: 60 },
      attrs: {
        body: {
          fill: '#8b5cf6',
          stroke: '#7c3aed',
          strokeWidth: 2,
          rx: 20,
          ry: 20,
          cursor: 'move'
        },
        label: {
          text: 'Lager',
          fill: 'white',
          fontSize: 14,
          fontWeight: '600',
          cursor: 'move'
        }
      }
    })
    shapes.push(roundedRect)

    // Add shapes to the graph
    graph.addCells(shapes)

    // Set up drag functionality
    paper.on('cell:pointerdown', (cellView: joint.dia.CellView, evt: any, x: number, y: number) => {
      const mainPaper = (window as any).mainJointPaper
      if (!mainPaper) return

      const cell = cellView.model
      const clone = cell.clone()

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
  }, [currentView])

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