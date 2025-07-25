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
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Variante {
  id: string
  bezeichnung: string
  zustand: string | null
  typ: string
  baugruppen: Baugruppe[]
}

interface Baugruppe {
  id: string
  bezeichnung: string
  artikelnummer: string
  variantenTyp: string
  prozesszeit: number | null
  volumen: number | null
  prozesse: Prozess[]
  baugruppentyp?: {
    id: string
    bezeichnung: string
  }
}

interface Prozess {
  id: string
  name: string
}

interface Baugruppentyp {
  id: string
  bezeichnung: string
  beschreibung?: string | null
}

interface Produkt {
  id: string
  bezeichnung: string
  seriennummer: string
  baugruppentypen: Baugruppentyp[]
  varianten: Variante[]
}

interface ConfiguratorContentProps {
  factoryId: string
}

export function ConfiguratorContent({ factoryId }: ConfiguratorContentProps) {
  const [selectedVariante, setSelectedVariante] = useState<Variante | null>(null)
  const [selectedProdukt, setSelectedProdukt] = useState<Produkt | null>(null)
  const [allBaugruppen, setAllBaugruppen] = useState<Baugruppe[]>([])
  const [allBaugruppentypen, setAllBaugruppentypen] = useState<Baugruppentyp[]>([])
  const [allProzesse, setAllProzesse] = useState<Prozess[]>([])
  const [loading, setLoading] = useState(false)
  const [currentView, setCurrentView] = useState<'variante' | 'baugruppen' | 'kapazitaet' | 'produkt'>('variante')
  const [factoryData, setFactoryData] = useState<any>(null)

  const fetchFactoryData = async () => {
    try {
      const response = await fetch('/api/factories')
      const data = await response.json()
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('Invalid response format:', data)
        return
      }
      
      const factory = data.find((f: any) => f.id === factoryId)
      
      if (factory) {
        setFactoryData(factory)
        
        // Sammle alle einzigartigen Baugruppen, Baugruppentypen und Prozesse
        const baugruppenMap = new Map<string, Baugruppe>()
        const baugruppentypMap = new Map<string, Baugruppentyp>()
        const prozesseMap = new Map<string, Prozess>()
        
        factory.produkte.forEach((produkt: Produkt) => {
          // Baugruppentypen vom Produkt
          produkt.baugruppentypen.forEach((typ: Baugruppentyp) => {
            baugruppentypMap.set(typ.id, typ)
          })
          
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
        setAllBaugruppentypen(Array.from(baugruppentypMap.values()))
        setAllProzesse(Array.from(prozesseMap.values()))
      }
    } catch (error) {
      console.error('Error fetching factory data:', error)
    }
  }

  useEffect(() => {
    fetchFactoryData()
  }, [factoryId])

  useEffect(() => {
    const handleVarianteSelection = async (event: CustomEvent) => {
      setCurrentView('variante')
      setLoading(true)
      const varianteId = event.detail
      
      try {
        const response = await fetch('/api/factories')
        const data = await response.json()
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.error('Invalid response format:', data)
          setLoading(false)
          return
        }
        
        const factory = data.find((f: any) => f.id === factoryId)
        
        if (factory) {
          // Finde die ausgewählte Variante
          for (const produkt of factory.produkte) {
            const variante = produkt.varianten.find((v: Variante) => v.id === varianteId)
            if (variante) {
              setSelectedVariante(variante)
              break
            }
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching variante details:', error)
        setLoading(false)
      }
    }

    const handleViewChange = (event: CustomEvent) => {
      const view = event.detail
      setCurrentView(view)
      if (view !== 'variante') {
        setSelectedVariante(null)
      }
      if (view !== 'produkt') {
        setSelectedProdukt(null)
      }
    }

    const handleProduktSelection = async (event: CustomEvent) => {
      setCurrentView('produkt')
      const produktId = event.detail
      
      try {
        const response = await fetch('/api/factories')
        const data = await response.json()
        
        if (!Array.isArray(data)) {
          console.error('Invalid response format:', data)
          return
        }
        
        const factory = data.find((f: any) => f.id === factoryId)
        if (factory) {
          const produkt = factory.produkte.find((p: Produkt) => p.id === produktId)
          if (produkt) {
            setSelectedProdukt(produkt)
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error)
      }
    }

    window.addEventListener('varianteSelected', handleVarianteSelection as unknown as EventListener)
    window.addEventListener('viewChanged', handleViewChange as unknown as EventListener)
    window.addEventListener('produktSelected', handleProduktSelection as unknown as EventListener)
    
    return () => {
      window.removeEventListener('varianteSelected', handleVarianteSelection as unknown as EventListener)
      window.removeEventListener('viewChanged', handleViewChange as unknown as EventListener)
      window.removeEventListener('produktSelected', handleProduktSelection as unknown as EventListener)
    }
  }, [factoryId])

  // Baugruppen View
  if (currentView === 'baugruppen') {
    return (
      <div className="flex flex-col h-full p-6 gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Baugruppen Management</h2>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Baugruppentyp erstellen
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Baugruppe erstellen
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 flex-1">
          {/* Baugruppentypen */}
          <Card>
            <CardHeader>
              <CardTitle>Baugruppentypen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="w-[100px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBaugruppentypen.map((typ) => (
                    <TableRow key={typ.id}>
                      <TableCell className="font-medium">{typ.bezeichnung}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {typ.beschreibung || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Baugruppen */}
          <Card>
            <CardHeader>
              <CardTitle>Alle Baugruppen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bezeichnung</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Art</TableHead>
                      <TableHead>Art-Nr.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allBaugruppen.map((baugruppe) => (
                      <TableRow key={baugruppe.id}>
                        <TableCell className="font-medium">{baugruppe.bezeichnung}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {baugruppe.baugruppentyp?.bezeichnung || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {baugruppe.variantenTyp}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{baugruppe.artikelnummer}</TableCell>
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

  // Kapazität View
  if (currentView === 'kapazitaet') {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Kapazitätsansicht</h3>
              <p className="text-muted-foreground">
                Diese Ansicht wird später implementiert und zeigt die Kapazitätsauslastung der Factory an.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Produkt View
  if (currentView === 'produkt' && selectedProdukt) {
    return (
      <div className="flex flex-col h-full p-6 gap-6">
        <div>
          <h2 className="text-2xl font-bold">{selectedProdukt.bezeichnung}</h2>
          <p className="text-muted-foreground">Seriennummer: {selectedProdukt.seriennummer}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Zugeordnete Baugruppentypen</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Baugruppentyp</TableHead>
                  <TableHead>Beschreibung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProdukt.baugruppentypen.map((typ) => (
                  <TableRow key={typ.id}>
                    <TableCell className="font-medium">{typ.bezeichnung}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {typ.beschreibung || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Varianten View (Default)
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
                <span className="font-semibold">Typ:</span>{' '}
                <Badge variant="default">
                  {selectedVariante.typ}
                </Badge>
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
                      {bg.bezeichnung} ({bg.baugruppentyp?.bezeichnung})
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
            <CardTitle className="text-base">Baugruppen dieser Variante</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto h-[calc(100%-4rem)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Art-Nr.</TableHead>
                    <TableHead>Prozesszeit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedVariante.baugruppen.map((baugruppe) => (
                    <TableRow key={baugruppe.id}>
                      <TableCell className="font-medium">{baugruppe.bezeichnung}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {baugruppe.baugruppentyp?.bezeichnung || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{baugruppe.artikelnummer}</TableCell>
                      <TableCell>{baugruppe.prozesszeit ? `${baugruppe.prozesszeit} Min` : '-'}</TableCell>
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