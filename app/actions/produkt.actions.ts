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

export async function createProdukt(data: Prisma.ProduktCreateInput) {
  try {
    const newProdukt = await prisma.produkt.create({
      data,
      include: {
        baugruppentypen: true,
        varianten: true,
        factory: true
      }
    })

    if (newProdukt.factoryId) {
      revalidatePath(`/factory/${newProdukt.factoryId}`)
    }

    return { success: true, data: newProdukt }
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

export async function updateProdukt(produktId: string, data: Prisma.ProduktUpdateInput) {
  try {
    const updatedProdukt = await prisma.produkt.update({
      where: { id: produktId },
      data,
      include: {
        baugruppentypen: true,
        varianten: true,
        factory: true
      }
    })

    if (updatedProdukt.factoryId) {
      revalidatePath(`/factory/${updatedProdukt.factoryId}`)
    }

    return { success: true, data: updatedProdukt }
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
    const produkt = await prisma.produkt.findUnique({
      where: { id: produktId },
      select: { factoryId: true }
    })

    await prisma.produkt.delete({
      where: { id: produktId }
    })

    if (produkt?.factoryId) {
      revalidatePath(`/factory/${produkt.factoryId}`)
    }

    return { success: true }
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