'use client'

import { useEffect, useRef } from 'react'
import * as joint from '@joint/plus'

interface JointJSProductViewProps {
  produktId: string
  produktName: string
}

export function JointJSProductView({ produktId, produktName }: JointJSProductViewProps) {
  const paperRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<joint.dia.Graph | null>(null)
  const paperInstanceRef = useRef<joint.dia.Paper | null>(null)
  const paperScrollerRef = useRef<joint.ui.PaperScroller | null>(null)

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
      grid: {
        size: 20,
        visible: true,
        args: [
          {
            color: '#e0e0e0',
            thickness: 1
          },
          {
            color: '#c0c0c0',
            thickness: 2,
            scaleFactor: 5
          }
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
      }
    })
    paperScrollerRef.current = paperScroller

    // Append to DOM
    paperRef.current.appendChild(paperScroller.el)
    paperScroller.render()

    // Center the paper
    paperScroller.center()

    // Enable panning
    paper.on('blank:pointerdown', (evt: any) => {
      paperScroller.startPanning(evt)
    })

    // Add zoom controls
    paper.on('blank:mousewheel', (evt: any, x: number, y: number, delta: number) => {
      evt.preventDefault()
      const scale = paper.scale()
      paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01), x, y)
    })

    // Add initial text to show the grid is working
    const welcomeText = new joint.shapes.standard.Rectangle({
      position: { x: 100, y: 100 },
      size: { width: 300, height: 100 },
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#6366f1',
          strokeWidth: 2,
          rx: 10,
          ry: 10
        },
        label: {
          text: `${produktName}\nJointJS Paper mit Grid`,
          fill: '#1e293b',
          fontSize: 16,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: '500'
        }
      }
    })
    graph.addCell(welcomeText)

    // Cleanup
    return () => {
      // Remove global reference
      ;(window as any).mainJointPaper = null
      
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

  return (
    <div 
      ref={paperRef} 
      className="w-full h-full relative overflow-hidden bg-gray-50"
      style={{ minHeight: '600px' }}
    />
  )
}