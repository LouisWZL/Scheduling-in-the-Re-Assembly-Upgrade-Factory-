'use client'

import { useEffect, useState } from 'react'
import { PencilIcon, SaveIcon } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const isConfigurator = pathname.startsWith('/factory-configurator/')

  useEffect(() => {
    fetchFactories()
  }, [])

  useEffect(() => {
    if (selectedFactory) {
      const factory = factories.find(f => f.id === selectedFactory)
      setCurrentFactory(factory || null)
    }
  }, [selectedFactory, factories])

  // Update URL when factory changes in configurator
  useEffect(() => {
    if (isConfigurator && selectedFactory && pathname !== `/factory-configurator/${selectedFactory}`) {
      router.push(`/factory-configurator/${selectedFactory}`)
    }
  }, [selectedFactory, isConfigurator, pathname, router])

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
        onClick={() => {
          if (isConfigurator) {
            router.push('/')
          } else {
            router.push(`/factory-configurator/${selectedFactory}`)
          }
        }}
        disabled={!currentFactory}
      >
        {isConfigurator ? <SaveIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
      </Button>
    </div>
  )
}