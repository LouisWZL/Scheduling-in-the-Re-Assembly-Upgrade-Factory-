'use client'

import { useEffect, useRef } from 'react'
import * as joint from '@joint/plus'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface JointJSProductViewProps {
  produktId: string
  produktName: string
}

export function JointJSProductView({ produktId, produktName }: JointJSProductViewProps) {
  const paperRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<joint.dia.Graph | null>(null)
  const paperInstanceRef = useRef<joint.dia.Paper | null>(null)
  const paperScrollerRef = useRef<joint.ui.PaperScroller | null>(null)
  const currentHaloRef = useRef<joint.ui.Halo | null>(null)
  const selectionRef = useRef<joint.ui.Selection | null>(null)

  useEffect(() => {
    if (!paperRef.current) return

    // Create Graph
    const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes })
    graphRef.current = graph

    // Create Paper with grid
    const paper = new joint.dia.Paper({
      width: 2000,
      height: 2000,
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
      interactive: true,
      linkPinning: false,
      snapLinks: { radius: 20 },
      markAvailable: true,
      async: true,
      frozen: false,
      sorting: joint.dia.Paper.sorting.APPROX,
      defaultConnectionPoint: { name: 'boundary' },
      defaultAnchor: { name: 'center' },
      defaultConnector: { name: 'rounded' },
      highlighting: {
        default: {
          name: 'stroke',
          options: {
            padding: 6,
            attrs: {
              stroke: '#6366f1',
              'stroke-width': 2
            }
          }
        }
      }
    })
    paperInstanceRef.current = paper

    // Make paper globally available for the stencil
    ;(window as any).mainJointPaper = paper

    // Create PaperScroller for better navigation
    const paperScroller = new joint.ui.PaperScroller({
      paper: paper,
      autoResizePaper: true,
      padding: 100,
      cursor: 'grab',
      baseWidth: paperRef.current.clientWidth,
      baseHeight: paperRef.current.clientHeight,
      contentOptions: {
        padding: 100,
        allowNewOrigin: 'any',
        useModelGeometry: true
      },
      scrollWheel: false // Disable scroll wheel zoom
    })
    paperScrollerRef.current = paperScroller

    // Append to DOM
    paperRef.current.appendChild(paperScroller.el)
    paperScroller.render()

    // Center the paper
    paperScroller.center()

    // Remove the old panning setup as it's now handled in the selection logic above

    // Disable mousewheel zoom
    paper.on('blank:mousewheel', (evt: any) => {
      evt.preventDefault()
      evt.stopPropagation()
    })
    
    // Also disable mousewheel on the paperScroller element
    paperScroller.el.addEventListener('wheel', (evt: WheelEvent) => {
      evt.preventDefault()
      evt.stopPropagation()
    }, { passive: false })

    // Don't add any initial shapes - let the user drag from stencil

    // Set up Selection for multi-select with CTRL/CMD
    const selection = new joint.ui.Selection({ 
      paper: paper,
      useModelGeometry: true
    })
    selectionRef.current = selection
    
    // Remove unwanted selection tools - keep only remove and unlink
    selection.removeHandle('rotate')
    selection.removeHandle('resize')

    // Start selection box on blank area (when not panning)
    let isPanning = false
    
    paper.on('blank:pointerdown', (evt: any) => {
      // Check if CTRL/CMD is pressed for selection box
      if (evt.ctrlKey || evt.metaKey) {
        selection.startSelecting(evt)
      } else {
        // Otherwise start panning
        isPanning = true
        paperScroller.startPanning(evt)
      }
    })

    paper.on('blank:pointerup', () => {
      isPanning = false
    })

    // Handle CTRL/CMD click on elements for multi-select
    paper.on('element:pointerup', (elementView: joint.dia.ElementView, evt: any) => {
      if (evt.ctrlKey || evt.metaKey) {
        // Hide halo when multi-selecting
        if (currentHaloRef.current) {
          currentHaloRef.current.remove()
          currentHaloRef.current = null
        }
        
        // Add/remove from selection using get() instead of contains()
        if (selection.collection.get(elementView.model)) {
          selection.collection.remove(elementView.model)
        } else {
          selection.collection.add(elementView.model)
        }
        
        // If only one element remains selected, show halo for it
        if (selection.collection.length === 1) {
          const selectedElement = selection.collection.first()
          const view = paper.findViewByModel(selectedElement)
          if (view) {
            createHalo(view)
          }
        }
      } else if (!isPanning) {
        // Single click without CTRL/CMD - clear selection and show halo
        selection.collection.reset()
        selection.collection.add(elementView.model)
        createHalo(elementView)
      }
    })

    // Remove from selection when clicking the selection box with CTRL/CMD
    selection.on('selection-box:pointerdown', (elementView: joint.dia.ElementView, evt: any) => {
      if (evt.ctrlKey || evt.metaKey) {
        selection.collection.remove(elementView.model)
        
        // If only one element remains, show halo for it
        if (selection.collection.length === 1) {
          const selectedElement = selection.collection.first()
          const view = paper.findViewByModel(selectedElement)
          if (view) {
            createHalo(view)
          }
        }
      }
    })
    
    // Hide halo when selection changes to multiple elements
    selection.on('reset add remove', () => {
      if (selection.collection.length > 1 && currentHaloRef.current) {
        currentHaloRef.current.remove()
        currentHaloRef.current = null
      }
    })

    // Set up Halo for element interaction
    const createHalo = (cellView: joint.dia.CellView) => {
      // Remove existing halo if any
      if (currentHaloRef.current) {
        currentHaloRef.current.remove()
        currentHaloRef.current = null
      }

      // Create new halo
      const halo = new joint.ui.Halo({ 
        cellView: cellView,
        boxContent: false,  // This hides the information box
        theme: 'modern'
      })
      
      // Remove unwanted tools - keep only remove and unlink
      halo.removeHandle('rotate')
      halo.removeHandle('clone')
      halo.removeHandle('fork')
      halo.removeHandle('link')
      halo.removeHandle('resize')
      
      halo.render()
      currentHaloRef.current = halo
    }

    // Hide halo and clear selection when clicking on blank area without CTRL/CMD
    paper.on('blank:pointerdown', (evt: any) => {
      if (!evt.ctrlKey && !evt.metaKey) {
        // Hide halo
        if (currentHaloRef.current) {
          currentHaloRef.current.remove()
          currentHaloRef.current = null
        }
        // Clear selection
        selection.collection.reset()
      }
    })

    // Cleanup
    return () => {
      // Remove global reference
      ;(window as any).mainJointPaper = null
      
      // Remove halo if exists
      if (currentHaloRef.current) {
        currentHaloRef.current.remove()
        currentHaloRef.current = null
      }
      
      // Remove selection if exists
      if (selectionRef.current) {
        selectionRef.current.remove()
        selectionRef.current = null
      }
      
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
  }, [produktId, produktName])

  const handleZoomIn = () => {
    if (paperScrollerRef.current) {
      paperScrollerRef.current.zoom(0.2, { max: 3 })
    }
  }

  const handleZoomOut = () => {
    if (paperScrollerRef.current) {
      paperScrollerRef.current.zoom(-0.2, { min: 0.2 })
    }
  }

  const handleZoomToFit = () => {
    if (paperScrollerRef.current) {
      paperScrollerRef.current.zoomToFit({
        minScale: 0.2,
        maxScale: 2,
        padding: 20
      })
    }
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-white shadow-sm hover:bg-gray-50"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-white shadow-sm hover:bg-gray-50"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleZoomToFit}
          className="bg-white shadow-sm hover:bg-gray-50"
          title="Zoom to Fit"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Paper Container */}
      <div 
        ref={paperRef} 
        className="w-full h-full"
      />
    </div>
  )
}