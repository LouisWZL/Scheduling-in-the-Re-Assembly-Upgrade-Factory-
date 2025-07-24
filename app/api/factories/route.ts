import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const factories = await prisma.reassemblyFactory.findMany({
      include: {
        produkte: {
          include: {
            varianten: {
              include: {
                baugruppen: {
                  include: {
                    prozesse: true
                  }
                }
              }
            }
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

    return NextResponse.json(factories)
  } catch (error) {
    console.error('Error fetching factories:', error)
    return NextResponse.json({ error: 'Failed to fetch factories' }, { status: 500 })
  }
}