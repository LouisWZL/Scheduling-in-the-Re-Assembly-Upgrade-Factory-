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
  const stencilInstanceRef = useRef<joint.ui.Stencil | null>(null)
  const [baugruppentypen, setBaugruppentypen] = useState<Baugruppentyp[]>([])
  const allBaugruppentypenRef = useRef<Baugruppentyp[]>([])
  const usedBaugruppentypenRef = useRef<Set<string>>(new Set())

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
          
          const uniqueBaugruppentypen = Array.from(baugruppentypMap.values())
          setBaugruppentypen(uniqueBaugruppentypen)
          allBaugruppentypenRef.current = uniqueBaugruppentypen
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
      if (stencilInstanceRef.current) {
        stencilInstanceRef.current.remove()
        stencilInstanceRef.current = null
      }
      return
    }

    // Wait for main paper and graph to be available
    const initializeStencil = () => {
      const mainPaper = (window as any).mainJointPaper
      const mainGraph = (window as any).mainJointGraph
      if (!mainPaper || !mainGraph) {
        // Retry after a short delay
        setTimeout(initializeStencil, 100)
        return
      }

    // Create the Stencil
    const stencil = new joint.ui.Stencil({
      paper: mainPaper,
      width: 280,
      height: '100%',
      layout: {
        columns: 2,
        columnWidth: 120,
        rowHeight: 80,
        columnGap: 20,
        rowGap: 20,
        marginX: 20,
        marginY: 20,
        resizeToFit: true
      },
      dropAnimation: {
        duration: 300,
        easing: 'ease-in-out'
      },
      dragStartClone: (cell: joint.dia.Cell) => {
        const clone = cell.clone()
        // Make semi-transparent during drag
        if (clone.isElement()) {
          clone.attr('body/opacity', 0.7)
        }
        return clone
      },
      dragEndClone: (cell: joint.dia.Cell) => {
        const clone = cell.clone()
        // Reset opacity
        if (clone.isElement()) {
          clone.attr('body/opacity', 1)
        }
        return clone
      },
      cellCursor: 'grab'
    })

    stencilInstanceRef.current = stencil

    // Function to create shapes for Baugruppentypen
    const createShapesForStencil = () => {
      const shapes: joint.shapes.standard.Rectangle[] = []
      const colors = [
        { fill: '#6366f1', stroke: '#4f46e5' }, // Indigo
        { fill: '#10b981', stroke: '#059669' }, // Emerald
        { fill: '#f59e0b', stroke: '#d97706' }, // Amber
        { fill: '#ef4444', stroke: '#dc2626' }, // Red
        { fill: '#8b5cf6', stroke: '#7c3aed' }, // Violet
        { fill: '#14b8a6', stroke: '#0d9488' }, // Teal
      ]

      allBaugruppentypenRef.current.forEach((typ, index) => {
        // Only create shape if it's not currently used
        if (!usedBaugruppentypenRef.current.has(typ.id)) {
          const colorIndex = index % colors.length
          const color = colors[colorIndex]
          
          const shape = new joint.shapes.standard.Rectangle({
            size: { width: 120, height: 80 },
            attrs: {
              body: {
                fill: color.fill,
                stroke: color.stroke,
                strokeWidth: 2,
                rx: 8,
                ry: 8
              },
              label: {
                text: typ.bezeichnung,
                fill: 'white',
                fontSize: 14,
                fontWeight: '600',
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
          shape.set('originalIndex', index)
          
          shapes.push(shape)
        }
      })
      
      return shapes
    }

    // Render and append stencil
    if (stencilRef.current) {
      stencilRef.current.appendChild(stencil.render().el)
    }
    
    // Load initial shapes into stencil
    const initialShapes = createShapesForStencil()
    stencil.load(initialShapes)

    // Listen for successful drops to remove shapes from stencil
    stencil.on('element:drop', (elementView: joint.dia.ElementView) => {
      // Get the original element from the stencil
      const droppedElement = elementView.model
      const baugruppentyp = droppedElement.get('baugruppentyp')
      
      if (baugruppentyp) {
        // Mark this Baugruppentyp as used
        usedBaugruppentypenRef.current.add(baugruppentyp.id)
        
        // Reload stencil with only unused Baugruppentypen
        stencil.getGraph().clear()
        const newShapes = createShapesForStencil()
        stencil.load(newShapes)
      }
    })
    
    // Listen for element removal from main graph to add back to stencil
    mainGraph.on('remove', (cell: joint.dia.Cell) => {
      if (cell.isElement()) {
        const baugruppentyp = cell.get('baugruppentyp')
        if (baugruppentyp) {
          // Remove this Baugruppentyp from used set
          usedBaugruppentypenRef.current.delete(baugruppentyp.id)
          
          // Reload stencil with updated shapes
          stencil.getGraph().clear()
          const newShapes = createShapesForStencil()
          stencil.load(newShapes)
        }
      }
    })

    }

    // Start initialization
    initializeStencil()

    // Cleanup
    return () => {
      if (stencilInstanceRef.current) {
        stencilInstanceRef.current.remove()
        stencilInstanceRef.current = null
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
        <h2 className="text-sm font-semibold">Baugruppentypen</h2>
      </SidebarHeader>
      <SidebarContent className="p-0 relative">
        <div 
          ref={stencilRef} 
          className="h-full w-full relative"
          style={{ position: 'relative' }}
        />
      </SidebarContent>
    </Sidebar>
  )
}