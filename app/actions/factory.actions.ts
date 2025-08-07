"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export async function updateFactoryName(id: string, name: string) {
  try {
    const factory = await prisma.reassemblyFactory.update({
      where: { id },
      data: { name }
    })
    
    revalidatePath('/factory-configurator')
    revalidatePath(`/factory-configurator/${id}`)
    revalidatePath('/api/factories')
    
    return {
      success: true,
      data: factory,
      message: 'Factory-Name erfolgreich aktualisiert'
    }
  } catch (error) {
    console.error('Error updating factory name:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Factory nicht gefunden'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Aktualisieren des Factory-Namens'
    }
  }
}

export async function updateFactoryCapacity(id: string, kapazität: number) {
  try {
    // Validate capacity
    if (kapazität < 1) {
      return {
        success: false,
        error: 'Die Kapazität muss mindestens 1 betragen'
      }
    }
    
    const factory = await prisma.reassemblyFactory.update({
      where: { id },
      data: { kapazität }
    })
    
    revalidatePath('/factory-configurator')
    revalidatePath(`/factory-configurator/${id}`)
    revalidatePath('/api/factories')
    
    return {
      success: true,
      data: factory,
      message: 'Factory-Kapazität erfolgreich aktualisiert'
    }
  } catch (error) {
    console.error('Error updating factory capacity:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Factory nicht gefunden'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Aktualisieren der Factory-Kapazität'
    }
  }
}

export async function updateFactorySchichtmodell(id: string, schichtmodell: 'EINSCHICHT' | 'ZWEISCHICHT' | 'DREISCHICHT') {
  try {
    const factory = await prisma.reassemblyFactory.update({
      where: { id },
      data: { schichtmodell }
    })
    
    revalidatePath('/factory-configurator')
    revalidatePath(`/factory-configurator/${id}`)
    revalidatePath('/api/factories')
    
    return {
      success: true,
      data: factory,
      message: 'Schichtmodell erfolgreich aktualisiert'
    }
  } catch (error) {
    console.error('Error updating factory schichtmodell:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Factory nicht gefunden'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Aktualisieren des Schichtmodells'
    }
  }
}

export async function updateFactoryMontagestationen(id: string, anzahlMontagestationen: number) {
  try {
    // Validate anzahlMontagestationen
    if (anzahlMontagestationen < 1 || anzahlMontagestationen > 100) {
      return {
        success: false,
        error: 'Die Anzahl der Montagestationen muss zwischen 1 und 100 liegen'
      }
    }
    
    const factory = await prisma.reassemblyFactory.update({
      where: { id },
      data: { anzahlMontagestationen }
    })
    
    revalidatePath('/factory-configurator')
    revalidatePath(`/factory-configurator/${id}`)
    revalidatePath('/api/factories')
    
    return {
      success: true,
      data: factory,
      message: 'Anzahl der Montagestationen erfolgreich aktualisiert'
    }
  } catch (error) {
    console.error('Error updating factory montagestationen:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Factory nicht gefunden'
        }
      }
    }
    
    return {
      success: false,
      error: 'Fehler beim Aktualisieren der Montagestationen'
    }
  }
}

export async function deleteAllFactoryOrders(factoryId: string) {
  try {
    // First, delete all BaugruppeInstances for orders of this factory
    await prisma.baugruppeInstance.deleteMany({
      where: {
        auftrag: {
          factoryId
        }
      }
    })
    
    // Then delete all Liefertermine for orders of this factory
    await prisma.liefertermin.deleteMany({
      where: {
        auftrag: {
          factoryId
        }
      }
    })
    
    // Finally, delete all orders for this factory
    await prisma.auftrag.deleteMany({
      where: {
        factoryId
      }
    })
    
    revalidatePath('/')
    revalidatePath(`/factory-configurator/${factoryId}`)
    
    return {
      success: true,
      message: 'Alle Aufträge und zugehörigen Daten wurden erfolgreich gelöscht'
    }
  } catch (error) {
    console.error('Error deleting factory orders:', error)
    
    return {
      success: false,
      error: 'Fehler beim Löschen der Aufträge'
    }
  }
}

export async function getFactory(id: string) {
  try {
    const factory = await prisma.reassemblyFactory.findUnique({
      where: { id },
      include: {
        produkte: {
          include: {
            baugruppentypen: true,
            varianten: true
          }
        },
        auftraege: {
          include: {
            kunde: true,
            produktvariante: true
          }
        }
      }
    })
    
    if (!factory) {
      return {
        success: false,
        error: 'Factory nicht gefunden'
      }
    }
    
    return {
      success: true,
      data: factory
    }
  } catch (error) {
    console.error('Error fetching factory:', error)
    
    return {
      success: false,
      error: 'Fehler beim Abrufen der Factory'
    }
  }
}