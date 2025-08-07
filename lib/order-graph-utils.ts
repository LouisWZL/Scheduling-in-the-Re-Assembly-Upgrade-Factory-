/**
 * Utility functions for transforming product graphs to order-specific graphs
 */

import { VariantenTyp, Baugruppe } from '@prisma/client'

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
 * Transform a product graph to an order-specific graph
 * Replaces Baugruppentypen with compatible Baugruppen
 */
export function transformProductGraphToOrderGraph(
  productGraph: GraphData,
  baugruppen: BaugruppeWithRelations[],
  variantenTyp: VariantenTyp
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
        const zustand = getRandomZustand()

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

  // Second pass: Process links and handle removed nodes
  const processedLinks = new Set<string>()
  
  productGraph.cells.forEach(cell => {
    // Only process links
    if (!cell.source || !cell.target) {
      return
    }

    const linkKey = `${cell.source.id}-${cell.target.id}`
    if (processedLinks.has(linkKey)) {
      return // Skip duplicate links
    }

    // If both source and target exist (not removed), keep the link
    if (!nodesToRemove.has(cell.source.id) && !nodesToRemove.has(cell.target.id)) {
      newCells.push(cell)
      processedLinks.add(linkKey)
      return
    }

    // Handle node removal with link preservation
    if (nodesToRemove.has(cell.source.id) || nodesToRemove.has(cell.target.id)) {
      const newLinks = reconnectLinksForRemovedNode(
        productGraph.cells,
        cell,
        nodesToRemove,
        processedLinks
      )
      newLinks.forEach(link => {
        if (!processedLinks.has(`${link.source.id}-${link.target.id}`)) {
          newCells.push(link)
          processedLinks.add(`${link.source.id}-${link.target.id}`)
        }
      })
    }
  })

  return {
    graph: { cells: newCells },
    selectedBaugruppen,
    removedNodes
  }
}

/**
 * Reconnect links when a node is removed
 * Creates new links between all nodes that were connected through the removed node
 */
function reconnectLinksForRemovedNode(
  allCells: GraphCell[],
  currentLink: GraphCell,
  nodesToRemove: Set<string>,
  processedLinks: Set<string>
): GraphCell[] {
  const newLinks: GraphCell[] = []

  // Find all incoming and outgoing connections for removed nodes
  const incomingNodes = new Set<string>()
  const outgoingNodes = new Set<string>()

  // Check if source is removed
  if (nodesToRemove.has(currentLink.source!.id)) {
    // Find all nodes that connect TO the removed node
    allCells.forEach(cell => {
      if (cell.target?.id === currentLink.source!.id && !nodesToRemove.has(cell.source!.id)) {
        incomingNodes.add(cell.source!.id)
      }
    })
    // Current link's target is an outgoing node
    if (!nodesToRemove.has(currentLink.target!.id)) {
      outgoingNodes.add(currentLink.target!.id)
    }
  }

  // Check if target is removed
  if (nodesToRemove.has(currentLink.target!.id)) {
    // Current link's source is an incoming node
    if (!nodesToRemove.has(currentLink.source!.id)) {
      incomingNodes.add(currentLink.source!.id)
    }
    // Find all nodes that the removed node connects TO
    allCells.forEach(cell => {
      if (cell.source?.id === currentLink.target!.id && !nodesToRemove.has(cell.target!.id)) {
        outgoingNodes.add(cell.target!.id)
      }
    })
  }

  // Create new links between all incoming and outgoing nodes
  incomingNodes.forEach(sourceId => {
    outgoingNodes.forEach(targetId => {
      const linkKey = `${sourceId}-${targetId}`
      if (!processedLinks.has(linkKey)) {
        newLinks.push({
          id: `${sourceId}-${targetId}-reconnected`,
          type: 'standard.Link',
          source: { id: sourceId },
          target: { id: targetId },
          attrs: currentLink.attrs || {}
        })
      }
    })
  })

  return newLinks
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
  variantenTyp: VariantenTyp
): {
  graphData: any
  baugruppenInstances: Array<{ baugruppeId: string; zustand: number }>
} {
  const productGraph = produkt.graphData as GraphData

  const { graph, selectedBaugruppen } = transformProductGraphToOrderGraph(
    productGraph,
    baugruppen,
    variantenTyp
  )

  return {
    graphData: graph,
    baugruppenInstances: selectedBaugruppen
  }
}