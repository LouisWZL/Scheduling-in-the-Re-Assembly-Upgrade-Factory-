'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as joint from '@joint/plus'
import { getProdukt, updateProduktGraph } from '@/app/actions/produkt.actions'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

interface JointJSProductViewProps {
  produktId: string
  produktName: string
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomToFit?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onCanUndoChange?: (canUndo: boolean) => void
  onCanRedoChange?: (canRedo: boolean) => void
  onSave?: () => void
  onSavingChange?: (isSaving: boolean) => void
}

export function JointJSProductView({ 
  produktId, 
  produktName,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onUndo,
  onRedo,
  onCanUndoChange,
  onCanRedoChange,
  onSave,
  onSavingChange
}: JointJSProductViewProps) {
  const paperRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<joint.dia.Graph | null>(null)
  const paperInstanceRef = useRef<joint.dia.Paper | null>(null)
  const paperScrollerRef = useRef<joint.ui.PaperScroller | null>(null)
  const currentHaloRef = useRef<joint.ui.Halo | null>(null)
  const selectionRef = useRef<joint.ui.Selection | null>(null)
  const commandManagerRef = useRef<joint.dia.CommandManager | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [graphState, setGraphState] = useState<any>(null)
  const debouncedGraphState = useDebounce(graphState, 1000)

  // Auto-save disabled - manual save only
  // useEffect(() => {
  //   if (!debouncedGraphState || isInitialLoad) return
  //   
  //   const saveGraph = async () => {
  //     if (onSavingChange) onSavingChange(true)
  //     
  //     try {
  //       const result = await updateProduktGraph(produktId, debouncedGraphState)
  //       if (result.success) {
  //         // Silent save for auto-save
  //         console.log('Graph auto-saved')
  //       } else {
  //         toast.error(result.error || 'Fehler beim automatischen Speichern')
  //       }
  //     } catch (error) {
  //       console.error('Error saving graph:', error)
  //       toast.error('Fehler beim automatischen Speichern')
  //     } finally {
  //       if (onSavingChange) onSavingChange(false)
  //     }
  //   }
  //   
  //   saveGraph()
  // }, [debouncedGraphState, produktId, isInitialLoad, onSavingChange])

  // This effect is now removed as loading happens in the main effect

  useEffect(() => {
    if (!paperRef.current) return

    // Create Graph
    const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes })
    graphRef.current = graph
    
    // Create CommandManager for undo/redo
    const commandManager = new joint.dia.CommandManager({ graph })
    commandManagerRef.current = commandManager
    
    // Listen to command manager stack changes
    commandManager.on('stack', () => {
      if (onCanUndoChange) onCanUndoChange(commandManager.hasUndo())
      if (onCanRedoChange) onCanRedoChange(commandManager.hasRedo())
      
      // Dispatch event to update stencil after undo/redo
      window.dispatchEvent(new CustomEvent('graph-changed'))
    })
    
    // Listen to graph changes for manual save tracking
    // graph.on('change add remove', () => {
    //   if (!isInitialLoad) {
    //     setGraphState(graph.toJSON())
    //   }
    // })

    // Create Paper with grid and connection validation
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
      frozen: true,
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
        },
        magnetAvailability: {
          name: 'addClass',
          options: {
            className: 'available-magnet'
          }
        },
        elementAvailability: {
          name: 'addClass',
          options: {
            className: 'available-element'
          }
        }
      },
      validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
        // Prevent linking from input ports
        if (magnetS && magnetS.getAttribute('port-group') === 'in') return false
        // Prevent linking from output ports to input ports within one element
        if (cellViewS === cellViewT) return false
        // Prevent linking to output ports
        return magnetT && magnetT.getAttribute('port-group') === 'in'
      },
      validateMagnet: function(cellView, magnet) {
        // Disable linking interaction for magnets marked as passive
        return magnet.getAttribute('magnet') !== 'passive'
      }
    })
    paperInstanceRef.current = paper

    // Make paper and graph globally available for the stencil
    ;(window as any).mainJointPaper = paper
    ;(window as any).mainJointGraph = graph
    
    // Dispatch custom event to signal paper is ready
    window.dispatchEvent(new CustomEvent('jointjs-paper-ready'))

    // Create PaperScroller for better navigation
    const paperScroller = new joint.ui.PaperScroller({
      paper: paper,
      autoResizePaper: true,
      padding: 100,
      cursor: 'default',
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
    
    // Load initial data if available
    const loadInitialData = async () => {
      try {
        const result = await getProdukt(produktId)
        if (result.success && result.data?.graphData) {
          const graphData = typeof result.data.graphData === 'string' 
            ? JSON.parse(result.data.graphData) 
            : result.data.graphData
          
          graph.fromJSON(graphData)
          console.log('Initial graph data loaded')
          
          // Dispatch event to update stencil after graph is loaded
          window.dispatchEvent(new CustomEvent('graph-loaded'))
        }
      } catch (error) {
        console.error('Error loading initial graph:', error)
      } finally {
        // Check if paper still exists before unfreezing
        try {
          if (paper) {
            paper.unfreeze()
          }
        } catch (err) {
          // Paper was already removed, ignore the error
          console.log('Paper already removed, skipping unfreeze')
        }
        setIsInitialLoad(false)
      }
    }
    
    // Load data and then unfreeze
    loadInitialData()

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
    
    // Add ports to elements when they are added to the graph
    graph.on('add', (cell: joint.dia.Cell) => {
      if (cell.isElement()) {
        // Define port configuration
        const portsIn = {
          position: {
            name: 'top',
            args: {}
          },
          attrs: {
            portBody: {
              magnet: 'passive', // Make input ports passive (cannot start connections)
              r: 8,
              fill: '#ffffff',
              stroke: '#22529a',
              strokeWidth: 2
            }
          },
          markup: [{
            tagName: 'circle',
            selector: 'portBody'
          }]
        }

        const portsOut = {
          position: {
            name: 'bottom',
            args: {}
          },
          attrs: {
            portBody: {
              magnet: true,
              r: 8,
              fill: '#ffffff',
              stroke: '#22529a',
              strokeWidth: 2
            }
          },
          markup: [{
            tagName: 'circle',
            selector: 'portBody'
          }]
        }

        // Only add ports if the element doesn't already have them
        const existingPorts = (cell as joint.dia.Element).getPorts()
        if (existingPorts.length === 0) {
          (cell as joint.dia.Element).addPorts([
            {
              id: 'in',
              group: 'in'
            },
            {
              id: 'out', 
              group: 'out'
            }
          ])
          
          // Set port groups
          ;(cell as joint.dia.Element).prop('ports/groups', {
            'in': portsIn,
            'out': portsOut
          })
        }
      }
    })

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
        // Start panning on blank area
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
      } else {
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

    // Setup keyboard shortcuts
    const handleKeydown = (evt: KeyboardEvent) => {
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'z' && !evt.shiftKey) {
        evt.preventDefault()
        if (commandManagerRef.current?.hasUndo()) {
          commandManagerRef.current.undo()
        }
      } else if ((evt.ctrlKey || evt.metaKey) && (evt.key === 'y' || (evt.key === 'z' && evt.shiftKey))) {
        evt.preventDefault()
        if (commandManagerRef.current?.hasRedo()) {
          commandManagerRef.current.redo()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeydown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      
      // Remove global references
      ;(window as any).mainJointPaper = null
      ;(window as any).mainJointGraph = null
      
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
  }, [produktId])

  // Setup external control handlers
  useEffect(() => {
    if (onZoomIn) {
      window.jointJSZoomIn = () => {
        if (paperScrollerRef.current) {
          paperScrollerRef.current.zoom(0.2, { max: 3 })
        }
      }
    }
    
    if (onZoomOut) {
      window.jointJSZoomOut = () => {
        if (paperScrollerRef.current) {
          paperScrollerRef.current.zoom(-0.2, { min: 0.2 })
        }
      }
    }
    
    if (onZoomToFit) {
      window.jointJSZoomToFit = () => {
        if (paperScrollerRef.current) {
          paperScrollerRef.current.zoomToFit({
            minScale: 0.2,
            maxScale: 2,
            padding: 20
          })
        }
      }
    }
    
    if (onUndo) {
      window.jointJSUndo = () => {
        if (commandManagerRef.current?.hasUndo()) {
          commandManagerRef.current.undo()
          // Stencil update is now handled by commandManager 'stack' event
        }
      }
    }
    
    if (onRedo) {
      window.jointJSRedo = () => {
        if (commandManagerRef.current?.hasRedo()) {
          commandManagerRef.current.redo()
          // Stencil update is now handled by commandManager 'stack' event
        }
      }
    }
    
    if (onSave) {
      window.jointJSSave = async () => {
        if (!graphRef.current) return
        
        if (onSavingChange) onSavingChange(true)
        
        try {
          const graphData = graphRef.current.toJSON()
          const result = await updateProduktGraph(produktId, graphData)
          if (result.success) {
            // Show message with Baugruppentypen count
            toast.success(result.message || 'Graph erfolgreich gespeichert')
            if (window.onGraphChanged) {
              window.onGraphChanged(false)
            }
            // Dispatch event to update sidebar or other components
            window.dispatchEvent(new CustomEvent('factoryUpdated'))
          } else {
            toast.error(result.error || 'Fehler beim Speichern')
          }
        } catch (error) {
          console.error('Error saving graph:', error)
          toast.error('Fehler beim Speichern')
        } finally {
          if (onSavingChange) onSavingChange(false)
        }
      }
    }
    
    return () => {
      delete window.jointJSZoomIn
      delete window.jointJSZoomOut
      delete window.jointJSZoomToFit
      delete window.jointJSUndo
      delete window.jointJSRedo
      delete window.jointJSSave
    }
  }, [onZoomIn, onZoomOut, onZoomToFit, onUndo, onRedo, onSave, produktId, onSavingChange])

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Paper Container */}
      <div 
        ref={paperRef} 
        className="w-full h-full"
      />
    </div>
  )
}

// Declare global window properties for external control
declare global {
  interface Window {
    jointJSZoomIn?: () => void
    jointJSZoomOut?: () => void
    jointJSZoomToFit?: () => void
    jointJSUndo?: () => void
    jointJSRedo?: () => void
    jointJSSave?: () => void
    mainJointPaper?: joint.dia.Paper
    mainJointGraph?: joint.dia.Graph
    onGraphChanged?: (hasChanges: boolean) => void
  }
}