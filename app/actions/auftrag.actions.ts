'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { AuftragsPhase, UpgradeTyp, VariantenTyp, Prisma } from '@prisma/client'
import { initializeCustomers, getRandomKunde } from './kunde.actions'
import { createOrderGraphFromProduct, getConstrainedZustand } from '@/lib/order-graph-utils'

/**
 * Get all orders for a factory
 */
export async function getAuftraege(factoryId: string) {
  try {
    const auftraege = await prisma.auftrag.findMany({
      where: { factoryId },
      include: {
        kunde: true,
        produktvariante: {
          include: {
            produkt: true
          }
        },
        liefertermine: {
          where: { istAktuell: true }
        },
        baugruppenInstances: {
          include: {
            baugruppe: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: auftraege }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { success: false, error: 'Fehler beim Abrufen der Aufträge' }
  }
}

/**
 * Create a single order with optional constrained zustand values
 * @param factoryId The factory ID
 * @param constrainedZustandValues Optional array of zustand values to use
 */
async function createSingleOrder(
  factoryId: string, 
  constrainedZustandValues?: number[]
) {
  try {
    // Get factory with product and variants
    const factory = await prisma.reassemblyFactory.findUnique({
      where: { id: factoryId },
      include: {
        produkte: {
          include: {
            varianten: true,
            baugruppentypen: true
          }
        },
        baugruppen: {
          include: {
            baugruppentyp: true
          }
        },
        auftraege: true
      }
    })

    if (!factory) {
      return { success: false, error: 'Factory nicht gefunden' }
    }

    // Check if factory has a product
    if (factory.produkte.length === 0) {
      return { success: false, error: 'Factory hat kein Produkt konfiguriert' }
    }

    // Check capacity
    if (factory.auftraege.length >= factory.kapazität) {
      return { success: false, error: 'Factory-Kapazität erreicht' }
    }

    const produkt = factory.produkte[0] // Factory has only one product

    // Check if product has variants
    if (produkt.varianten.length === 0) {
      return { success: false, error: 'Produkt hat keine Varianten' }
    }

    // Get random customer
    const kundeResult = await getRandomKunde()
    if (!kundeResult.success || !kundeResult.data) {
      return { success: false, error: 'Kein Kunde verfügbar' }
    }

    // Select random variant (Basic or Premium)
    const randomVariante = produkt.varianten[Math.floor(Math.random() * produkt.varianten.length)]
    
    // Transform product graph to order graph
    let graphData = null
    let baugruppenInstances: Array<{ baugruppeId: string; zustand: number; upgradeTyp?: UpgradeTyp }> = []

    if (produkt.graphData) {
      const transformation = createOrderGraphFromProduct(
        produkt,
        factory.baugruppen,
        randomVariante.typ as VariantenTyp,
        constrainedZustandValues
      )
      graphData = transformation.graphData
      
      // Assign upgrade types based on condition
      baugruppenInstances = transformation.baugruppenInstances.map(bi => ({
        baugruppeId: bi.baugruppeId,
        zustand: bi.zustand,
        upgradeTyp: bi.zustand < 30 ? UpgradeTyp.PFLICHT : undefined
      }))
      
      // Check if we have at least one PFLICHT upgrade
      const hasPflichtUpgrade = baugruppenInstances.some(bi => bi.upgradeTyp === UpgradeTyp.PFLICHT)
      
      // Randomly select assemblies for WUNSCH upgrades (from those without PFLICHT)
      const eligibleForWunsch = baugruppenInstances.filter(bi => !bi.upgradeTyp)
      
      // WICHTIG: Jeder Auftrag muss mindestens ein Upgrade haben (PFLICHT oder WUNSCH)
      // - Wenn es bereits PFLICHT-Upgrades gibt (Baugruppen < 30%), können zusätzlich 0-2 WUNSCH-Upgrades hinzugefügt werden
      // - Wenn es keine PFLICHT-Upgrades gibt, MUSS mindestens 1 WUNSCH-Upgrade hinzugefügt werden
      let wunschCount: number
      if (!hasPflichtUpgrade && eligibleForWunsch.length > 0) {
        // Kein PFLICHT-Upgrade vorhanden -> MUSS mindestens 1 WUNSCH-Upgrade haben
        wunschCount = Math.floor(Math.random() * 2) + 1 // 1 oder 2
      } else {
        // PFLICHT-Upgrade(s) vorhanden -> kann zusätzlich 0-2 WUNSCH-Upgrades haben
        wunschCount = Math.floor(Math.random() * 3) // 0, 1, oder 2
      }
      
      for (let i = 0; i < Math.min(wunschCount, eligibleForWunsch.length); i++) {
        const randomIndex = Math.floor(Math.random() * eligibleForWunsch.length)
        const selected = eligibleForWunsch.splice(randomIndex, 1)[0]
        const index = baugruppenInstances.findIndex(bi => bi.baugruppeId === selected.baugruppeId)
        if (index !== -1) {
          baugruppenInstances[index].upgradeTyp = UpgradeTyp.WUNSCH
        }
      }
    }

    // Create order with transaction
    const auftrag = await prisma.$transaction(async (tx) => {
      // Create the order
      const newAuftrag = await tx.auftrag.create({
        data: {
          kundeId: kundeResult.data.id,
          produktvarianteId: randomVariante.id,
          factoryId: factoryId,
          phase: AuftragsPhase.ERSTKONTAKT,
          graphData: graphData as any,
          // Create assembly instances
          baugruppenInstances: {
            create: baugruppenInstances.map(bi => ({
              baugruppeId: bi.baugruppeId,
              zustand: bi.zustand,
              upgradeTyp: bi.upgradeTyp || null
            }))
          },
          // Create initial delivery date
          liefertermine: {
            create: {
              typ: 'GROB_ZEITSCHIENE',
              datum: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              istAktuell: true,
              bemerkung: 'Initiale Zeitschätzung'
            }
          }
        },
        include: {
          kunde: true,
          produktvariante: {
            include: {
              produkt: true
            }
          },
          baugruppenInstances: {
            include: {
              baugruppe: true
            }
          },
          liefertermine: true
        }
      })

      // Store the transformed graph in the produktvariante links field if not already done
      if (graphData && !randomVariante.links) {
        await tx.produktvariante.update({
          where: { id: randomVariante.id },
          data: { links: graphData as any }
        })
      }

      return newAuftrag
    })

    return { success: true, data: auftrag }
  } catch (error) {
    console.error('Error creating order:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `Datenbankfehler: ${error.message}` }
    }
    return { success: false, error: 'Fehler beim Erstellen des Auftrags' }
  }
}

/**
 * Generate multiple orders for a factory with batch average zustand of 65%
 */
export async function generateOrders(factoryId: string, count: number = 10) {
  try {
    // Ensure customers are initialized
    const initResult = await initializeCustomers()
    if (!initResult.success) {
      return { success: false, error: 'Fehler beim Initialisieren der Kunden' }
    }

    // Get factory info to know how many Baugruppen per order
    const factory = await prisma.reassemblyFactory.findUnique({
      where: { id: factoryId },
      include: {
        produkte: {
          include: {
            baugruppentypen: true
          }
        }
      }
    })

    if (!factory || factory.produkte.length === 0) {
      return { success: false, error: 'Factory oder Produkt nicht gefunden' }
    }

    const avgBaugruppen = factory.produkte[0].baugruppentypen.length || 5
    const targetBatchAverage = 65
    const totalBaugruppenCount = count * avgBaugruppen
    
    // Pre-generate all zustand values to achieve batch average of 65%
    const allZustandValues: number[] = []
    let currentSum = 0
    
    for (let i = 0; i < totalBaugruppenCount; i++) {
      const remaining = totalBaugruppenCount - i - 1
      const zustand = getConstrainedZustand(currentSum, targetBatchAverage, i, remaining)
      allZustandValues.push(zustand)
      currentSum += zustand
    }
    
    // Shuffle the values to distribute them randomly across orders
    for (let i = allZustandValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allZustandValues[i], allZustandValues[j]] = [allZustandValues[j], allZustandValues[i]]
    }

    const results = {
      created: 0,
      failed: 0,
      errors: [] as string[],
      totalZustand: 0,
      totalBaugruppen: 0
    }

    // Create orders one by one with pre-calculated zustand values
    for (let i = 0; i < count; i++) {
      // Extract zustand values for this order
      const orderZustandValues = allZustandValues.slice(
        i * avgBaugruppen, 
        (i + 1) * avgBaugruppen
      )
      
      const result = await createSingleOrder(factoryId, orderZustandValues)
      if (result.success && result.data) {
        results.created++
        // Track actual zustand values for reporting
        const orderBaugruppen = (result.data as any).baugruppenInstances || []
        orderBaugruppen.forEach((bi: any) => {
          results.totalZustand += bi.zustand
          results.totalBaugruppen++
        })
      } else {
        results.failed++
        if (result.error && !results.errors.includes(result.error)) {
          results.errors.push(result.error)
        }
      }
    }
    
    const actualAverage = results.totalBaugruppen > 0 
      ? Math.round(results.totalZustand / results.totalBaugruppen)
      : 0

    revalidatePath('/')
    revalidatePath(`/factory-configurator/${factoryId}`)

    return {
      success: true,
      message: `${results.created} Aufträge erstellt (Ø ${actualAverage}% Zustand), ${results.failed} fehlgeschlagen`,
      created: results.created,
      failed: results.failed,
      errors: results.errors,
      averageZustand: actualAverage
    }
  } catch (error) {
    console.error('Error generating orders:', error)
    return { success: false, error: 'Fehler beim Generieren der Aufträge' }
  }
}

/**
 * Get order statistics for a factory
 */
export async function getAuftragStatistics(factoryId: string) {
  try {
    const stats = await prisma.auftrag.groupBy({
      by: ['phase'],
      where: { factoryId },
      _count: {
        phase: true
      }
    })

    const totalOrders = await prisma.auftrag.count({
      where: { factoryId }
    })

    const variantStats = await prisma.auftrag.groupBy({
      by: ['produktvarianteId'],
      where: { factoryId },
      _count: {
        produktvarianteId: true
      }
    })

    // Get variant details
    const variantDetails = await prisma.produktvariante.findMany({
      where: {
        id: {
          in: variantStats.map(v => v.produktvarianteId)
        }
      },
      select: {
        id: true,
        bezeichnung: true,
        typ: true
      }
    })

    const variantMap = new Map(variantDetails.map(v => [v.id, v]))
    const variantCounts = variantStats.map(stat => ({
      variant: variantMap.get(stat.produktvarianteId),
      count: stat._count.produktvarianteId
    }))

    return {
      success: true,
      data: {
        totalOrders,
        byPhase: stats,
        byVariant: variantCounts
      }
    }
  } catch (error) {
    console.error('Error fetching order statistics:', error)
    return { success: false, error: 'Fehler beim Abrufen der Auftragsstatistiken' }
  }
}

/**
 * Update order phase
 */
export async function updateAuftragPhase(auftragId: string, phase: AuftragsPhase) {
  try {
    const updatedAuftrag = await prisma.auftrag.update({
      where: { id: auftragId },
      data: { phase },
      include: {
        kunde: true,
        produktvariante: {
          include: {
            produkt: true
          }
        }
      }
    })

    revalidatePath('/')
    
    return {
      success: true,
      data: updatedAuftrag,
      message: `Auftragsphase auf ${phase} aktualisiert`
    }
  } catch (error) {
    console.error('Error updating order phase:', error)
    return { success: false, error: 'Fehler beim Aktualisieren der Auftragsphase' }
  }
}

/**
 * Delete an order
 */
export async function deleteAuftrag(auftragId: string) {
  try {
    // Delete with cascade (delivery dates and assembly instances)
    await prisma.$transaction(async (tx) => {
      // Delete delivery dates
      await tx.liefertermin.deleteMany({
        where: { auftragId }
      })

      // Delete assembly instances
      await tx.baugruppeInstance.deleteMany({
        where: { auftragId }
      })

      // Delete order
      await tx.auftrag.delete({
        where: { id: auftragId }
      })
    })

    revalidatePath('/')
    
    return {
      success: true,
      message: 'Auftrag erfolgreich gelöscht'
    }
  } catch (error) {
    console.error('Error deleting order:', error)
    return { success: false, error: 'Fehler beim Löschen des Auftrags' }
  }
}