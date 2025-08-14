'use client'

import { useEffect, useRef, useState } from 'react'
import * as joint from '@joint/plus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

// Import JointJS CSS - IMPORTANT!
import '@joint/plus/joint-plus.css'

interface OrderProcessGraphViewerProps {
  order: {
    id: string
    produktvariante: {
      bezeichnung: string
      typ: string
    }
    processGraphData?: any
  } | null
}

export function OrderProcessGraphViewer({ order }: OrderProcessGraphViewerProps) {
  const paperRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<joint.dia.Graph | null>(null)
  const paperInstanceRef = useRef<joint.dia.Paper | null>(null)
  const paperScrollerRef = useRef<joint.ui.PaperScroller | null>(null)
  
  // Zoom functions
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
        padding: 50
      })
    }
  }

  useEffect(() => {
    if (!paperRef.current) return

    console.log('OrderProcessGraphViewer - Order changed:', order?.id, 'Has processGraphData:', !!order?.processGraphData)

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

    if (!order?.processGraphData?.cells) {
      return
    }

    // Create Graph
    const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes })
    graphRef.current = graph

    // Create Paper with proper configuration
    const paper = new joint.dia.Paper({
      width: 1200,
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
      interactive: false, // Disable all interactions
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
      console.log('Loading process graph with cells:', order.processGraphData.cells.length)
      graph.fromJSON(order.processGraphData)
      
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
      console.error('Error loading process graph:', error)
    }

    // Add panning functionality
    paper.on('blank:pointerdown', (evt: any) => {
      paperScroller.startPanning(evt)
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
  
  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeydown = (evt: KeyboardEvent) => {
      // Check if focus is on an input element
      if (evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) {
        return
      }
      
      if (evt.ctrlKey || evt.metaKey) {
        if (evt.key === '+' || evt.key === '=') {
          evt.preventDefault()
          handleZoomIn()
        } else if (evt.key === '-') {
          evt.preventDefault()
          handleZoomOut()
        } else if (evt.key === '0') {
          evt.preventDefault()
          handleZoomToFit()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  if (!order) {
    return null
  }

  if (!order.processGraphData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prozess</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Kein Prozessgraph verfügbar
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prozess</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative" style={{ height: '460px' }}>
          <div 
            ref={paperRef} 
            className="absolute inset-0 border rounded-lg bg-muted/10"
            style={{ overflow: 'hidden' }}
          />
          {/* Zoom Controls */}
          <div className="absolute top-2 right-2 flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1 shadow-sm border">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleZoomIn}
              title="Vergrößern"
              className="h-7 w-7"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleZoomOut}
              title="Verkleinern"
              className="h-7 w-7"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleZoomToFit}
              title="Ansicht anpassen"
              className="h-7 w-7"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}