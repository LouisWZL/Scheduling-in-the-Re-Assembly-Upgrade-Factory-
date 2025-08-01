'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export async function getProdukt(produktId: string) {
  try {
    const produkt = await prisma.produkt.findUnique({
      where: { id: produktId },
      include: {
        baugruppentypen: true,
        varianten: {
          include: {
            baugruppen: {
              include: {
                baugruppentyp: true,
                prozesse: true
              }
            }
          }
        },
        factory: true
      }
    })

    if (!produkt) {
      return { success: false, error: 'Produkt nicht gefunden' }
    }

    return { success: true, data: produkt }
  } catch (error) {
    console.error('Error fetching product:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `Datenbankfehler: ${error.message}` }
    }
    return { success: false, error: 'Fehler beim Abrufen des Produkts' }
  }
}

export async function updateProduktGraph(produktId: string, graphData: any) {
  try {
    const updatedProdukt = await prisma.produkt.update({
      where: { id: produktId },
      data: { graphData }
    })

    // Revalidate the factory page to reflect changes
    if (updatedProdukt.factoryId) {
      revalidatePath(`/factory/${updatedProdukt.factoryId}`)
    }

    return { success: true, data: updatedProdukt }
  } catch (error) {
    console.error('Error updating product graph:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { success: false, error: 'Produkt nicht gefunden' }
      }
      return { success: false, error: `Datenbankfehler: ${error.message}` }
    }
    return { success: false, error: 'Fehler beim Speichern des Graphen' }
  }
}

export async function createProdukt(
  factoryId: string,
  data: {
    bezeichnung: string
    seriennummer: string
    glbFile?: string | null
  }
) {
  try {
    // Check if seriennummer already exists
    const existing = await prisma.produkt.findUnique({
      where: { seriennummer: data.seriennummer }
    })

    if (existing) {
      return {
        success: false,
        error: 'Ein Produkt mit dieser Seriennummer existiert bereits'
      }
    }

    const newProdukt = await prisma.produkt.create({
      data: {
        bezeichnung: data.bezeichnung,
        seriennummer: data.seriennummer,
        glbFile: data.glbFile,
        factoryId
      },
      include: {
        baugruppentypen: true,
        varianten: true,
        factory: true
      }
    })

    revalidatePath('/factory-configurator')
    revalidatePath(`/factory-configurator/${factoryId}`)
    revalidatePath('/api/factories') // Revalidate factories API for sidebar

    return { success: true, data: newProdukt, message: 'Produkt erfolgreich erstellt' }
  } catch (error) {
    console.error('Error creating product:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: 'Ein Produkt mit dieser Seriennummer existiert bereits' }
      }
      return { success: false, error: `Datenbankfehler: ${error.message}` }
    }
    return { success: false, error: 'Fehler beim Erstellen des Produkts' }
  }
}

export async function updateProdukt(
  produktId: string,
  data: {
    bezeichnung: string
    seriennummer: string
    glbFile?: string | null
  }
) {
  try {
    // Check if new seriennummer already exists (excluding current product)
    const existing = await prisma.produkt.findFirst({
      where: {
        seriennummer: data.seriennummer,
        NOT: { id: produktId }
      }
    })

    if (existing) {
      return {
        success: false,
        error: 'Ein anderes Produkt mit dieser Seriennummer existiert bereits'
      }
    }

    const updatedProdukt = await prisma.produkt.update({
      where: { id: produktId },
      data: {
        bezeichnung: data.bezeichnung,
        seriennummer: data.seriennummer,
        glbFile: data.glbFile
      },
      include: {
        baugruppentypen: true,
        varianten: true,
        factory: true
      }
    })

    revalidatePath('/factory-configurator')
    if (updatedProdukt.factoryId) {
      revalidatePath(`/factory-configurator/${updatedProdukt.factoryId}`)
    }
    revalidatePath('/api/factories') // Revalidate factories API for sidebar

    return { success: true, data: updatedProdukt, message: 'Produkt erfolgreich aktualisiert' }
  } catch (error) {
    console.error('Error updating product:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { success: false, error: 'Produkt nicht gefunden' }
      }
      if (error.code === 'P2002') {
        return { success: false, error: 'Ein Produkt mit dieser Seriennummer existiert bereits' }
      }
      return { success: false, error: `Datenbankfehler: ${error.message}` }
    }
    return { success: false, error: 'Fehler beim Aktualisieren des Produkts' }
  }
}

export async function deleteProdukt(produktId: string) {
  try {
    // Check if product has variants
    const produkt = await prisma.produkt.findUnique({
      where: { id: produktId },
      include: {
        varianten: true
      }
    })

    if (!produkt) {
      return {
        success: false,
        error: 'Produkt nicht gefunden'
      }
    }

    if (produkt.varianten.length > 0) {
      return {
        success: false,
        error: 'Produkt kann nicht gelöscht werden, da es noch Varianten besitzt'
      }
    }

    await prisma.produkt.delete({
      where: { id: produktId }
    })

    revalidatePath('/factory-configurator')
    if (produkt.factoryId) {
      revalidatePath(`/factory-configurator/${produkt.factoryId}`)
    }
    revalidatePath('/api/factories') // Revalidate factories API for sidebar

    return { success: true, message: 'Produkt erfolgreich gelöscht' }
  } catch (error) {
    console.error('Error deleting product:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { success: false, error: 'Produkt nicht gefunden' }
      }
      if (error.code === 'P2003') {
        return { success: false, error: 'Produkt kann nicht gelöscht werden, da es noch verwendet wird' }
      }
      return { success: false, error: `Datenbankfehler: ${error.message}` }
    }
    return { success: false, error: 'Fehler beim Löschen des Produkts' }
  }
}

export async function getProdukte(factoryId: string) {
  try {
    const produkte = await prisma.produkt.findMany({
      where: { factoryId },
      include: {
        varianten: true,
        baugruppentypen: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: produkte
    }
  } catch (error) {
    console.error('Error fetching Produkte:', error)
    
    return {
      success: false,
      error: 'Fehler beim Abrufen der Produkte'
    }
  }
}