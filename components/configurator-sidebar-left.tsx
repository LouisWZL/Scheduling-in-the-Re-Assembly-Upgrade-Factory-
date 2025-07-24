'use client'

import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Produkt {
  id: string
  bezeichnung: string
  seriennummer: string
  varianten: Variante[]
}

interface Variante {
  id: string
  bezeichnung: string
  zustand: string | null
}

export function ConfiguratorSidebarLeft() {
  const [produkte, setProdukte] = useState<Produkt[]>([])
  const [selectedVariante, setSelectedVariante] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProdukte()
  }, [])

  const fetchProdukte = async () => {
    try {
      const response = await fetch('/api/factories')
      const data = await response.json()
      if (data.length > 0) {
        setProdukte(data[0].produkte)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching produkte:', error)
      setLoading(false)
    }
  }

  const handleVarianteClick = (varianteId: string) => {
    setSelectedVariante(varianteId)
    // Event emitter oder Context API könnte hier verwendet werden
    window.dispatchEvent(new CustomEvent('varianteSelected', { detail: varianteId }))
  }

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader>
        <h2 className="px-2 text-lg font-semibold">Produkte & Varianten</h2>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarMenu>
            {loading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ) : (
              produkte.map((produkt) => (
                <SidebarMenuItem key={produkt.id}>
                  <SidebarMenuButton 
                    className="font-semibold cursor-default hover:bg-transparent"
                    disabled
                  >
                    <span>{produkt.bezeichnung}</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {produkt.varianten.map((variante) => (
                      <SidebarMenuSubItem key={variante.id}>
                        <SidebarMenuSubButton
                          onClick={() => handleVarianteClick(variante.id)}
                          isActive={selectedVariante === variante.id}
                          className="cursor-pointer"
                        >
                          <ChevronRight className="mr-2 h-4 w-4" />
                          <span>{variante.bezeichnung}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}