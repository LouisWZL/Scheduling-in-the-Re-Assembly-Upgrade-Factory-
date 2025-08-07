"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export async function createBaugruppe(data: {
  bezeichnung: string
  artikelnummer: string
  variantenTyp: 'basic' | 'premium' | 'basicAndPremium'
  baugruppentypId: string
  factoryId: string
  demontagezeit?: number | null
  montagezeit?: number | null
}) {
  try {
    const baugruppe = await prisma.baugruppe.create({
      data: {
        bezeichnung: data.bezeichnung,
        artikelnummer: data.artikelnummer,
        variantenTyp: data.variantenTyp,
        demontagezeit: data.demontagezeit,
        montagezeit: data.montagezeit,
        factory: {
          connect: { id: data.factoryId }
        },
        baugruppentyp: {
          connect: { id: data.baugruppentypId }
        }
      },
      include: {
        baugruppentyp: true,
        factory: true
      }
    })
    
    revalidatePath('/factory-configurator')
    
    return {
      success: true,
      data: baugruppe,
      message: 'Baugruppe erfolgreich erstellt'
    }
  } catch (error) {
    console.error('Error creating Baugruppe:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Eine Baugruppe mit dieser Artikelnummer existiert bereits'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Erstellen der Baugruppe'
    }
  }
}

export async function updateBaugruppe(id: string, data: {
  bezeichnung?: string
  artikelnummer?: string
  variantenTyp?: 'basic' | 'premium' | 'basicAndPremium'
  baugruppentypId?: string
  demontagezeit?: number | null
  montagezeit?: number | null
}) {
  try {
    // Check if type is changing and if it would affect existing Produktvarianten
    if (data.variantenTyp) {
      const currentBaugruppe = await prisma.baugruppe.findUnique({
        where: { id },
        include: {
          varianten: true
        }
      })
      
      if (currentBaugruppe) {
        // Check if any variante would become incompatible
        const incompatibleVarianten = currentBaugruppe.varianten.filter(variante => {
          if (data.variantenTyp === 'basic' && variante.typ === 'premium') return true
          if (data.variantenTyp === 'premium' && variante.typ === 'basic') return true
          return false
        })
        
        if (incompatibleVarianten.length > 0) {
          // Remove baugruppe from incompatible varianten
          for (const variante of incompatibleVarianten) {
            await prisma.produktvariante.update({
              where: { id: variante.id },
              data: {
                baugruppen: {
                  disconnect: { id }
                }
              }
            })
          }
        }
      }
    }
    
    const updateData: any = {
      bezeichnung: data.bezeichnung,
      artikelnummer: data.artikelnummer,
      variantenTyp: data.variantenTyp,
      demontagezeit: data.demontagezeit,
      montagezeit: data.montagezeit
    }
    
    if (data.baugruppentypId) {
      updateData.baugruppentyp = {
        connect: { id: data.baugruppentypId }
      }
    }
    
    const baugruppe = await prisma.baugruppe.update({
      where: { id },
      data: updateData,
      include: {
        baugruppentyp: true
      }
    })
    
    revalidatePath('/factory-configurator')
    
    return {
      success: true,
      data: baugruppe,
      message: 'Baugruppe erfolgreich aktualisiert'
    }
  } catch (error) {
    console.error('Error updating Baugruppe:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Eine Baugruppe mit dieser Artikelnummer existiert bereits'
        }
      }
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Baugruppe nicht gefunden'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Aktualisieren der Baugruppe'
    }
  }
}

export async function deleteBaugruppe(id: string) {
  try {
    // Check if Baugruppe is used by any Produktvariante
    const variantenCount = await prisma.produktvariante.count({
      where: {
        baugruppen: {
          some: { id }
        }
      }
    })
    
    if (variantenCount > 0) {
      return {
        success: false,
        error: `Diese Baugruppe wird von ${variantenCount} Produktvariante(n) verwendet und kann nicht gelöscht werden`
      }
    }
    
    await prisma.baugruppe.delete({
      where: { id }
    })
    
    revalidatePath('/factory-configurator')
    
    return {
      success: true,
      message: 'Baugruppe erfolgreich gelöscht'
    }
  } catch (error) {
    console.error('Error deleting Baugruppe:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Baugruppe nicht gefunden'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Löschen der Baugruppe'
    }
  }
}

export async function getBaugruppen(factoryId?: string) {
  try {
    const baugruppen = await prisma.baugruppe.findMany({
      where: factoryId ? { factoryId } : undefined,
      include: {
        baugruppentyp: true,
        prozesse: true,
        factory: true
      },
      orderBy: {
        bezeichnung: 'asc'
      }
    })
    
    return {
      success: true,
      data: baugruppen
    }
  } catch (error) {
    console.error('Error fetching Baugruppen:', error)
    
    return {
      success: false,
      error: 'Fehler beim Abrufen der Baugruppen'
    }
  }
}

export async function getBaugruppe(id: string) {
  try {
    const baugruppe = await prisma.baugruppe.findUnique({
      where: { id },
      include: {
        baugruppentyp: true,
        varianten: true,
        prozesse: true
      }
    })
    
    if (!baugruppe) {
      return {
        success: false,
        error: 'Baugruppe nicht gefunden'
      }
    }
    
    return {
      success: true,
      data: baugruppe
    }
  } catch (error) {
    console.error('Error fetching Baugruppe:', error)
    
    return {
      success: false,
      error: 'Fehler beim Abrufen der Baugruppe'
    }
  }
}

export async function getBaugruppenByTyp(baugruppentypId: string) {
  try {
    const baugruppen = await prisma.baugruppe.findMany({
      where: {
        baugruppentypId
      },
      include: {
        baugruppentyp: true,
        varianten: true,
        prozesse: true
      },
      orderBy: {
        bezeichnung: 'asc'
      }
    })
    
    return {
      success: true,
      data: baugruppen
    }
  } catch (error) {
    console.error('Error fetching Baugruppen by Typ:', error)
    
    return {
      success: false,
      error: 'Fehler beim Abrufen der Baugruppen'
    }
  }
}