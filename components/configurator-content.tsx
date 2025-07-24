'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Variante {
  id: string
  bezeichnung: string
  zustand: string | null
  baugruppen: Baugruppe[]
}

interface Baugruppe {
  id: string
  bezeichnung: string
  artikelnummer: string
  baugruppenart: string
  durchlaufzeit: number | null
  volumen: number | null
  prozesse: Prozess[]
}

interface Prozess {
  id: string
  name: string
}

interface ConfiguratorContentProps {
  factoryId: string
}

export function ConfiguratorContent({ factoryId }: ConfiguratorContentProps) {
  const [selectedVariante, setSelectedVariante] = useState<Variante | null>(null)
  const [allBaugruppen, setAllBaugruppen] = useState<Baugruppe[]>([])
  const [allProzesse, setAllProzesse] = useState<Prozess[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleVarianteSelection = async (event: CustomEvent) => {
      setLoading(true)
      const varianteId = event.detail
      
      try {
        const response = await fetch('/api/factories')
        const factories = await response.json()
        const factory = factories.find((f: any) => f.id === factoryId)
        
        if (factory) {
          
          // Finde die ausgewählte Variante
          for (const produkt of factory.produkte) {
            const variante = produkt.varianten.find((v: Variante) => v.id === varianteId)
            if (variante) {
              setSelectedVariante(variante)
              break
            }
          }
          
          // Sammle alle einzigartigen Baugruppen und Prozesse der Factory
          const baugruppenMap = new Map<string, Baugruppe>()
          const prozesseMap = new Map<string, Prozess>()
          
          factory.produkte.forEach((produkt: any) => {
            produkt.varianten.forEach((variante: Variante) => {
              variante.baugruppen.forEach((baugruppe: Baugruppe) => {
                baugruppenMap.set(baugruppe.id, baugruppe)
                baugruppe.prozesse.forEach((prozess: Prozess) => {
                  prozesseMap.set(prozess.id, prozess)
                })
              })
            })
          })
          
          setAllBaugruppen(Array.from(baugruppenMap.values()))
          setAllProzesse(Array.from(prozesseMap.values()))
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching variante details:', error)
        setLoading(false)
      }
    }

    window.addEventListener('varianteSelected', handleVarianteSelection as unknown as EventListener)
    return () => {
      window.removeEventListener('varianteSelected', handleVarianteSelection as unknown as EventListener)
    }
  }, [factoryId])

  if (!selectedVariante) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Keine Variante ausgewählt</h3>
              <p className="text-muted-foreground">
                Wählen Sie eine Produktvariante aus der linken Seitenleiste aus, um Details anzuzeigen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      {/* Oberer Bereich - 60vh */}
      <div className="flex-[6] min-h-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{selectedVariante.bezeichnung}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="font-semibold">ID:</span> {selectedVariante.id}
              </div>
              <div>
                <span className="font-semibold">Zustand:</span>{' '}
                <Badge variant={selectedVariante.zustand === 'SEHR_GUT' ? 'default' : 'secondary'}>
                  {selectedVariante.zustand || 'N/A'}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">Anzahl Baugruppen:</span> {selectedVariante.baugruppen.length}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Zugeordnete Baugruppen:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVariante.baugruppen.map((bg) => (
                    <Badge key={bg.id} variant="outline">
                      {bg.bezeichnung}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unterer Bereich - 40vh */}
      <div className="flex-[4] min-h-0 grid grid-cols-2 gap-6">
        {/* Baugruppen Tabelle */}
        <Card className="overflow-hidden">
          <CardHeader className="py-4">
            <CardTitle className="text-base">Alle Baugruppen der Factory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto h-[calc(100%-4rem)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead>Art-Nr.</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Durchlauf</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBaugruppen.map((baugruppe) => (
                    <TableRow key={baugruppe.id}>
                      <TableCell className="font-medium">{baugruppe.bezeichnung}</TableCell>
                      <TableCell>{baugruppe.artikelnummer}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {baugruppe.baugruppenart}
                        </Badge>
                      </TableCell>
                      <TableCell>{baugruppe.durchlaufzeit ? `${baugruppe.durchlaufzeit} Min` : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Prozesse Tabelle */}
        <Card className="overflow-hidden">
          <CardHeader className="py-4">
            <CardTitle className="text-base">Alle Prozesse der Factory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto h-[calc(100%-4rem)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prozess</TableHead>
                    <TableHead>ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProzesse.map((prozess) => (
                    <TableRow key={prozess.id}>
                      <TableCell className="font-medium">{prozess.name}</TableCell>
                      <TableCell className="text-muted-foreground">{prozess.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}