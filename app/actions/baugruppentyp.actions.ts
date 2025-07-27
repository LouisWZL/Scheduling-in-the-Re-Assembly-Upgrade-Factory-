"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export async function createBaugruppentyp(data: {
  bezeichnung: string
  beschreibung?: string | null
  factoryId: string
}) {
  try {
    const baugruppentyp = await prisma.baugruppentyp.create({
      data: {
        bezeichnung: data.bezeichnung,
        beschreibung: data.beschreibung,
        factory: {
          connect: { id: data.factoryId }
        }
      }
    })
    
    revalidatePath('/factory-configurator')
    
    return {
      success: true,
      data: baugruppentyp,
      message: 'Baugruppentyp erfolgreich erstellt'
    }
  } catch (error) {
    console.error('Error creating Baugruppentyp:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Ein Baugruppentyp mit dieser Bezeichnung existiert bereits'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Erstellen des Baugruppentyps'
    }
  }
}

export async function updateBaugruppentyp(id: string, data: {
  bezeichnung?: string
  beschreibung?: string | null
}) {
  try {
    const baugruppentyp = await prisma.baugruppentyp.update({
      where: { id },
      data: {
        bezeichnung: data.bezeichnung,
        beschreibung: data.beschreibung
      }
    })
    
    revalidatePath('/factory-configurator')
    
    return {
      success: true,
      data: baugruppentyp,
      message: 'Baugruppentyp erfolgreich aktualisiert'
    }
  } catch (error) {
    console.error('Error updating Baugruppentyp:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Ein Baugruppentyp mit dieser Bezeichnung existiert bereits'
        }
      }
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Baugruppentyp nicht gefunden'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Aktualisieren des Baugruppentyps'
    }
  }
}

export async function deleteBaugruppentyp(id: string) {
  try {
    // Check if Baugruppentyp is used by any Baugruppe
    const baugruppenCount = await prisma.baugruppe.count({
      where: { baugruppentypId: id }
    })
    
    if (baugruppenCount > 0) {
      return {
        success: false,
        error: `Dieser Baugruppentyp wird von ${baugruppenCount} Baugruppe(n) verwendet und kann nicht gelöscht werden`
      }
    }
    
    // Check if Baugruppentyp is assigned to any Produkt
    const produktCount = await prisma.produkt.count({
      where: {
        baugruppentypen: {
          some: { id }
        }
      }
    })
    
    if (produktCount > 0) {
      return {
        success: false,
        error: `Dieser Baugruppentyp ist ${produktCount} Produkt(en) zugeordnet und kann nicht gelöscht werden`
      }
    }
    
    await prisma.baugruppentyp.delete({
      where: { id }
    })
    
    revalidatePath('/factory-configurator')
    
    return {
      success: true,
      message: 'Baugruppentyp erfolgreich gelöscht'
    }
  } catch (error) {
    console.error('Error deleting Baugruppentyp:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Baugruppentyp nicht gefunden'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Löschen des Baugruppentyps'
    }
  }
}

export async function getBaugruppentypen(factoryId?: string) {
  try {
    const baugruppentypen = await prisma.baugruppentyp.findMany({
      where: factoryId ? { factoryId } : undefined,
      include: {
        baugruppen: true,
        produkte: true,
        factory: true
      },
      orderBy: {
        bezeichnung: 'asc'
      }
    })
    
    return {
      success: true,
      data: baugruppentypen
    }
  } catch (error) {
    console.error('Error fetching Baugruppentypen:', error)
    
    return {
      success: false,
      error: 'Fehler beim Abrufen der Baugruppentypen'
    }
  }
}

export async function getBaugruppentyp(id: string) {
  try {
    const baugruppentyp = await prisma.baugruppentyp.findUnique({
      where: { id },
      include: {
        baugruppen: true,
        produkte: true
      }
    })
    
    if (!baugruppentyp) {
      return {
        success: false,
        error: 'Baugruppentyp nicht gefunden'
      }
    }
    
    return {
      success: true,
      data: baugruppentyp
    }
  } catch (error) {
    console.error('Error fetching Baugruppentyp:', error)
    
    return {
      success: false,
      error: 'Fehler beim Abrufen des Baugruppentyps'
    }
  }
}