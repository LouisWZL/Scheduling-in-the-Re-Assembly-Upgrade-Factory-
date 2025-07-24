'use client'

import { useEffect, useState } from 'react'
import { PencilIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Factory {
  id: string
  name: string
  kapazität: number
  produkte: Product[]
  auftraege: Auftrag[]
}

interface Product {
  id: string
  bezeichnung: string
  seriennummer: string
  varianten: ProductVariant[]
}

interface ProductVariant {
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

interface Auftrag {
  id: string
  phase: string
  upgradeTyp: string
  kunde: {
    vorname: string
    nachname: string
  }
  produktvariante: {
    bezeichnung: string
  }
}

export function FactorySelector() {
  const [factories, setFactories] = useState<Factory[]>([])
  const [selectedFactory, setSelectedFactory] = useState<string>('')
  const [currentFactory, setCurrentFactory] = useState<Factory | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFactories()
  }, [])

  useEffect(() => {
    if (selectedFactory) {
      const factory = factories.find(f => f.id === selectedFactory)
      setCurrentFactory(factory || null)
    }
  }, [selectedFactory, factories])

  const fetchFactories = async () => {
    try {
      const response = await fetch('/api/factories')
      const data = await response.json()
      setFactories(data)
      if (data.length > 0) {
        setSelectedFactory(data[0].id)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching factories:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse h-10 w-[200px] bg-muted rounded-md" />
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedFactory} onValueChange={setSelectedFactory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Wähle eine Factory" />
          </SelectTrigger>
          <SelectContent>
            {factories.map((factory) => (
              <SelectItem key={factory.id} value={factory.id}>
                {factory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDialogOpen(true)}
          disabled={!currentFactory}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{currentFactory?.name}</DialogTitle>
          </DialogHeader>
          {currentFactory && (
            <Tabs defaultValue="produkte" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="produkte">Produkte</TabsTrigger>
                <TabsTrigger value="varianten">Produktvarianten</TabsTrigger>
                <TabsTrigger value="baugruppen">Baugruppen</TabsTrigger>
                <TabsTrigger value="prozesse">Prozesse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="produkte" className="space-y-4">
                <ScrollArea className="h-[600px] pr-4">
                  {currentFactory.produkte.map((produkt) => (
                    <div key={produkt.id} className="border rounded-lg p-4 mb-4">
                      <h3 className="font-semibold">{produkt.bezeichnung}</h3>
                      <p className="text-sm text-muted-foreground">SN: {produkt.seriennummer}</p>
                      <p className="text-sm mt-2">{produkt.varianten.length} Varianten</p>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="varianten" className="space-y-4">
                <ScrollArea className="h-[600px] pr-4">
                  {currentFactory.produkte.flatMap(p => p.varianten).map((variante) => (
                    <div key={variante.id} className="border rounded-lg p-4 mb-4">
                      <h3 className="font-semibold">{variante.bezeichnung}</h3>
                      <p className="text-sm text-muted-foreground">
                        Zustand: {variante.zustand || 'N/A'}
                      </p>
                      <p className="text-sm mt-2">{variante.baugruppen.length} Baugruppen</p>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="baugruppen" className="space-y-4">
                <ScrollArea className="h-[600px] pr-4">
                  {currentFactory.produkte
                    .flatMap(p => p.varianten)
                    .flatMap(v => v.baugruppen)
                    .filter((bg, index, self) => 
                      index === self.findIndex((b) => b.id === bg.id)
                    )
                    .map((baugruppe) => (
                      <div key={baugruppe.id} className="border rounded-lg p-4 mb-4">
                        <h3 className="font-semibold">{baugruppe.bezeichnung}</h3>
                        <p className="text-sm text-muted-foreground">
                          Art-Nr: {baugruppe.artikelnummer}
                        </p>
                        <p className="text-sm">Art: {baugruppe.baugruppenart}</p>
                        {baugruppe.durchlaufzeit && (
                          <p className="text-sm">Durchlaufzeit: {baugruppe.durchlaufzeit} Min</p>
                        )}
                        <p className="text-sm mt-2">{baugruppe.prozesse.length} Prozesse</p>
                      </div>
                    ))}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="prozesse" className="space-y-4">
                <ScrollArea className="h-[600px] pr-4">
                  {currentFactory.produkte
                    .flatMap(p => p.varianten)
                    .flatMap(v => v.baugruppen)
                    .flatMap(b => b.prozesse)
                    .filter((prozess, index, self) => 
                      index === self.findIndex((p) => p.id === prozess.id)
                    )
                    .map((prozess) => (
                      <div key={prozess.id} className="border rounded-lg p-4 mb-4">
                        <h3 className="font-semibold">{prozess.name}</h3>
                      </div>
                    ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}