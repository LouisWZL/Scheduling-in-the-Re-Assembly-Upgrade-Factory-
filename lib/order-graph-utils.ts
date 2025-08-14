/**
 * Utility functions for transforming product graphs to order-specific graphs
 */

import { VariantenTyp, Baugruppe, BaugruppeInstance } from '@prisma/client'

interface GraphCell {
  id: string
  type: string
  attrs?: any
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  source?: { id: string }
  target?: { id: string }
  baugruppentyp?: { id: string; bezeichnung: string }
  baugruppe?: { id: string; bezeichnung: string; artikelnummer: string }
  [key: string]: any
}

interface GraphData {
  cells: GraphCell[]
}

interface BaugruppeWithRelations extends Baugruppe {
  baugruppentyp?: {
    id: string
    bezeichnung: string
  } | null
}

/**
 * Get a random condition value between 0 and 100
 */
export function getRandomZustand(): number {
  return Math.floor(Math.random() * 101) // 0 to 100 inclusive
}

/**
 * Get a constrained random condition value that helps achieve a target average
 * @param currentAverage Current average of all generated values
 * @param targetAverage Target average to achieve
 * @param count Number of values already generated
 * @param remaining Number of values still to generate
 */
export function getConstrainedZustand(
  currentSum: number,
  targetAverage: number,
  count: number,
  remaining: number
): number {
  if (remaining === 0) {
    // For the last item, ensure we don't exceed bounds
    const targetSum = targetAverage * (count + 1)
    const neededValue = targetSum - currentSum
    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, Math.round(neededValue)))
  }
  
  // Calculate what average we need for remaining items
  const targetSum = targetAverage * (count + remaining + 1)
  const neededSum = targetSum - currentSum
  const neededAverage = neededSum / (remaining + 1)
  
  // Ensure neededAverage is within valid bounds
  const clampedNeededAverage = Math.max(0, Math.min(100, neededAverage))
  
  // Add some randomness but bias towards the needed average
  // Use a range of ±20 from the needed average, but strictly within 0-100
  const min = Math.max(0, Math.floor(clampedNeededAverage - 20))
  const max = Math.min(100, Math.ceil(clampedNeededAverage + 20))
  
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Check if a Baugruppe is compatible with a product variant type
 */
export function isBaugruppeCompatibleWithVariant(
  baugruppeVariantenTyp: VariantenTyp,
  produktvarianteTyp: VariantenTyp
): boolean {
  if (baugruppeVariantenTyp === 'basicAndPremium') {
    return true // Compatible with both
  }
  return baugruppeVariantenTyp === produktvarianteTyp
}

/**
 * Find compatible Baugruppen for a given Baugruppentyp and variant type
 */
export function findCompatibleBaugruppen(
  baugruppen: BaugruppeWithRelations[],
  baugruppentypId: string,
  variantenTyp: VariantenTyp
): BaugruppeWithRelations[] {
  return baugruppen.filter(bg => 
    bg.baugruppentypId === baugruppentypId &&
    isBaugruppeCompatibleWithVariant(bg.variantenTyp, variantenTyp)
  )
}

/**
 * Get a random element from an array
 */
function getRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Find a compatible replacement Baugruppe for reassemblies
 * @param currentBaugruppe The current Baugruppe that needs replacement
 * @param allBaugruppen All available Baugruppen in the factory
 * @param variantenTyp The variant type of the order (basic or premium)
 * @returns A randomly selected compatible replacement Baugruppe or undefined
 */
export function findCompatibleReplacementBaugruppe(
  currentBaugruppe: BaugruppeWithRelations,
  allBaugruppen: BaugruppeWithRelations[],
  variantenTyp: VariantenTyp
): BaugruppeWithRelations | undefined {
  // Filter for compatible replacement Baugruppen
  const compatibleBaugruppen = allBaugruppen.filter(bg => {
    // Must be of the same Baugruppentyp
    if (bg.baugruppentypId !== currentBaugruppe.baugruppentypId) return false
    
    // Must be compatible with the variant type
    if (!isBaugruppeCompatibleWithVariant(bg.variantenTyp, variantenTyp)) return false
    
    return true
  })
  
  // If there are other compatible Baugruppen, prefer those
  const otherCompatibleBaugruppen = compatibleBaugruppen.filter(bg => bg.id !== currentBaugruppe.id)
  
  // Use other Baugruppen if available, otherwise allow the same Baugruppe
  const candidateBaugruppen = otherCompatibleBaugruppen.length > 0 
    ? otherCompatibleBaugruppen 
    : compatibleBaugruppen
  
  // Return a random compatible Baugruppe
  return getRandomElement(candidateBaugruppen)
}

/**
 * Transform a product graph to an order-specific graph
 * Replaces Baugruppentypen with compatible Baugruppen
 */
export function transformProductGraphToOrderGraph(
  productGraph: GraphData,
  baugruppen: BaugruppeWithRelations[],
  variantenTyp: VariantenTyp,
  constrainedZustandValues?: number[]
): {
  graph: GraphData
  selectedBaugruppen: Array<{ baugruppeId: string; zustand: number }>
  removedNodes: string[]
} {
  if (!productGraph || !productGraph.cells) {
    return { 
      graph: { cells: [] }, 
      selectedBaugruppen: [],
      removedNodes: []
    }
  }

  const newCells: GraphCell[] = []
  const selectedBaugruppen: Array<{ baugruppeId: string; zustand: number }> = []
  const nodesToRemove = new Set<string>()
  const nodeReplacements = new Map<string, string>() // old node id -> new node id
  const removedNodes: string[] = []
  let zustandIndex = 0 // Track which constrained value to use next

  // First pass: Process shapes and determine which to replace or remove
  productGraph.cells.forEach(cell => {
    // Skip links in first pass
    if (cell.source || cell.target) {
      return
    }

    // Process shapes with Baugruppentyp
    if (cell.baugruppentyp) {
      const compatibleBaugruppen = findCompatibleBaugruppen(
        baugruppen,
        cell.baugruppentyp.id,
        variantenTyp
      )

      if (compatibleBaugruppen.length > 0) {
        // Replace with random compatible Baugruppe
        const selectedBaugruppe = getRandomElement(compatibleBaugruppen)!
        // Use constrained zustand value if available, otherwise random
        const zustand = constrainedZustandValues && zustandIndex < constrainedZustandValues.length
          ? constrainedZustandValues[zustandIndex++]
          : getRandomZustand()

        // Create new cell with Baugruppe instead of Baugruppentyp
        const newCell: GraphCell = {
          ...cell,
          baugruppe: {
            id: selectedBaugruppe.id,
            bezeichnung: selectedBaugruppe.bezeichnung,
            artikelnummer: selectedBaugruppe.artikelnummer
          },
          // Remove baugruppentyp
          baugruppentyp: undefined,
          // Update label
          attrs: {
            ...cell.attrs,
            label: {
              ...cell.attrs?.label,
              text: selectedBaugruppe.bezeichnung
            }
          }
        }

        newCells.push(newCell)
        selectedBaugruppen.push({
          baugruppeId: selectedBaugruppe.id,
          zustand
        })

        // Keep same node ID for link preservation
        nodeReplacements.set(cell.id, cell.id)
      } else {
        // No compatible Baugruppe found - mark for removal
        nodesToRemove.add(cell.id)
        removedNodes.push(cell.id)
      }
    } else {
      // Keep other shapes as-is
      newCells.push(cell)
    }
  })

  // Build adjacency lists for the graph
  const incomingLinks = new Map<string, Set<string>>() // node -> set of nodes that connect TO it
  const outgoingLinks = new Map<string, Set<string>>() // node -> set of nodes it connects TO
  
  // Build the adjacency lists from all links
  productGraph.cells.forEach(cell => {
    if (cell.source && cell.target) {
      // Extract node IDs (handle both direct ID and port-based connections)
      const sourceId = typeof cell.source === 'string' ? cell.source : cell.source.id
      const targetId = typeof cell.target === 'string' ? cell.target : cell.target.id
      
      // Add to outgoing links
      if (!outgoingLinks.has(sourceId)) {
        outgoingLinks.set(sourceId, new Set())
      }
      outgoingLinks.get(sourceId)!.add(targetId)
      
      // Add to incoming links
      if (!incomingLinks.has(targetId)) {
        incomingLinks.set(targetId, new Set())
      }
      incomingLinks.get(targetId)!.add(sourceId)
    }
  })

  // Second pass: Process links and handle removed nodes
  const processedLinks = new Set<string>()
  
  // For each removed node, connect its predecessors to its successors
  nodesToRemove.forEach(removedNodeId => {
    const predecessors = incomingLinks.get(removedNodeId) || new Set()
    const successors = outgoingLinks.get(removedNodeId) || new Set()
    
    // Create new links between all predecessors and successors
    predecessors.forEach(predId => {
      // Skip if predecessor is also being removed
      if (nodesToRemove.has(predId)) return
      
      successors.forEach(succId => {
        // Skip if successor is also being removed
        if (nodesToRemove.has(succId)) return
        
        const linkKey = `${predId}-${succId}`
        if (!processedLinks.has(linkKey)) {
          newCells.push({
            id: `${predId}-${succId}-reconnected`,
            type: 'standard.Link',
            source: { 
              id: predId,
              port: 'out'  // Connect from the 'out' port
            },
            target: { 
              id: succId,
              port: 'in'   // Connect to the 'in' port
            },
            attrs: {
              line: {
                stroke: '#525252',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  size: 8
                }
              }
            }
          })
          processedLinks.add(linkKey)
        }
      })
    })
  })
  
  // Add all original links that don't involve removed nodes
  productGraph.cells.forEach(cell => {
    if (cell.source && cell.target) {
      // Extract node IDs (handle both direct ID and port-based connections)
      const sourceId = typeof cell.source === 'string' ? cell.source : cell.source.id
      const targetId = typeof cell.target === 'string' ? cell.target : cell.target.id
      const linkKey = `${sourceId}-${targetId}`
      
      // Keep link if neither source nor target is removed
      if (!nodesToRemove.has(sourceId) && !nodesToRemove.has(targetId)) {
        if (!processedLinks.has(linkKey)) {
          newCells.push(cell)
          processedLinks.add(linkKey)
        }
      }
    }
  })

  return {
    graph: { cells: newCells },
    selectedBaugruppen,
    removedNodes
  }
}

/**
 * Create a graph data structure for a product variant based on the product graph
 */
export function createOrderGraphFromProduct(
  produkt: {
    graphData: any
    baugruppentypen?: Array<{ id: string; bezeichnung: string }>
  },
  baugruppen: BaugruppeWithRelations[],
  variantenTyp: VariantenTyp,
  constrainedZustandValues?: number[]
): {
  graphData: any
  baugruppenInstances: Array<{ baugruppeId: string; zustand: number }>
} {
  const productGraph = produkt.graphData as GraphData

  const { graph, selectedBaugruppen } = transformProductGraphToOrderGraph(
    productGraph,
    baugruppen,
    variantenTyp,
    constrainedZustandValues
  )

  return {
    graphData: graph,
    baugruppenInstances: selectedBaugruppen
  }
}

/**
 * Transform a process graph to order-specific process graph
 * Replaces Baugruppentypen with BaugruppenInstances
 */
export function transformProcessGraphToOrderGraph(
  processGraph: GraphData,
  baugruppenInstances: Array<{
    id: string
    zustand: number
    reAssemblyTyp?: any
    baugruppe: {
      id: string
      bezeichnung: string
      artikelnummer: string
      variantenTyp: string
      baugruppentyp?: {
        id: string
        bezeichnung: string
      } | null
    }
    austauschBaugruppe?: {
      id: string
      bezeichnung: string
      artikelnummer: string
      variantenTyp: string
      baugruppentyp?: {
        bezeichnung: string
      } | null
    } | null
  }>
): GraphData {
  if (!processGraph || !processGraph.cells || processGraph.cells.length === 0) {
    return { cells: [] }
  }

  const newCells: GraphCell[] = []
  
  // Create mapping from baugruppentyp to baugruppeninstance
  const baugruppentypToInstance = new Map<string, typeof baugruppenInstances[0]>()
  baugruppenInstances.forEach(instance => {
    if (instance.baugruppe.baugruppentyp) {
      baugruppentypToInstance.set(instance.baugruppe.baugruppentyp.id, instance)
    }
  })

  // Process each cell
  processGraph.cells.forEach(cell => {
    // Handle links - copy as is
    if (cell.source || cell.target) {
      newCells.push({
        ...cell,
        attrs: {
          ...cell.attrs,
          line: {
            ...cell.attrs?.line,
            stroke: '#000000',
            strokeWidth: 2
          }
        }
      })
      return
    }

    // Handle shapes
    const newCell: GraphCell = { ...cell }
    
    // Update colors for all shapes
    newCell.attrs = {
      ...cell.attrs,
      body: {
        ...cell.attrs?.body,
        fill: '#1a48a5',
        fillOpacity: 1,
        stroke: '#1a48a5',
        strokeWidth: 2
      },
      label: {
        ...cell.attrs?.label,
        fill: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold'
      }
    }

    // If this shape has a baugruppentyp, replace with baugruppeninstance
    if (cell.baugruppentyp) {
      const instance = baugruppentypToInstance.get(cell.baugruppentyp.id)
      
      if (instance) {
        // Remove baugruppentyp
        delete newCell.baugruppentyp
        
        // Add baugruppeninstance reference
        newCell.baugruppenInstance = {
          id: instance.id,
          baugruppeId: instance.baugruppe.id,
          bezeichnung: instance.baugruppe.bezeichnung,
          artikelnummer: instance.baugruppe.artikelnummer,
          zustand: instance.zustand
        }
        
        // Update label based on processType
        const processType = (cell as any).processType
        if (processType === 'demontage') {
          newCell.attrs.label.text = `Demontage-${instance.baugruppe.bezeichnung}`
        } else if (processType === 'remontage') {
          newCell.attrs.label.text = `Remontage-${instance.baugruppe.bezeichnung}`
        }
      }
    }
    
    // Special handling for Inspektion and Qualitätsprüfung
    if (cell.id === 'inspektion' || cell.id === 'qualitaetspruefung') {
      newCell.attrs.body.fill = '#1a48a5'
      newCell.attrs.label.fill = '#ffffff'
    }
    
    newCells.push(newCell)
  })

  return { cells: newCells }
}