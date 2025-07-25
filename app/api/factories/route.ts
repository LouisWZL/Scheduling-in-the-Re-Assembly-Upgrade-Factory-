import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const factories = await prisma.reassemblyFactory.findMany({
      include: {
        produkte: {
          include: {
            baugruppentypen: true,
            varianten: {
              include: {
                baugruppen: {
                  include: {
                    prozesse: true,
                    baugruppentyp: true
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
    console.error('Detailed error fetching factories:', error)
    // Return more detailed error in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        error: 'Failed to fetch factories',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to fetch factories' }, { status: 500 })
  }
}