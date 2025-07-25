'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, Wrench, Car, Package, Cpu, Cog, Box, BarChart3 } from 'lucide-react'
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
  baugruppentypen: Baugruppentyp[]
}

interface Variante {
  id: string
  bezeichnung: string
  zustand: string | null
  typ: string
}

interface Baugruppentyp {
  id: string
  bezeichnung: string
  beschreibung?: string | null
}

interface ConfiguratorSidebarLeftProps {
  factoryId: string
}

// Icon mapping for Baugruppentypen
const baugruppentypenIcons: Record<string, React.ComponentType<any>> = {
  Chassis: Car,
  Karosserie: Car,
  Fahrwerk: Wrench,
  Interieur: Package,
  Elektronik: Cpu,
  Antrieb: Cog,
}

export function ConfiguratorSidebarLeft({ factoryId }: ConfiguratorSidebarLeftProps) {
  const [produkte, setProdukte] = useState<Produkt[]>([])
  const [selectedVariante, setSelectedVariante] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [factoryName, setFactoryName] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProdukte()
  }, [factoryId])

  const fetchProdukte = async () => {
    try {
      const response = await fetch('/api/factories')
      const data = await response.json()
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('Invalid response format:', data)
        setProdukte([])
        setLoading(false)
        return
      }
      
      const factory = data.find((f: any) => f.id === factoryId)
      if (factory) {
        setProdukte(factory.produkte)
        setFactoryName(factory.name)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching produkte:', error)
      setProdukte([])
      setLoading(false)
    }
  }

  const handleVarianteClick = (varianteId: string) => {
    setSelectedVariante(varianteId)
    window.dispatchEvent(new CustomEvent('varianteSelected', { detail: varianteId }))
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  return (
    <Sidebar 
      side="left" 
      collapsible="icon"
      className="sticky top-0 h-svh border-r"
    >
      <SidebarHeader className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{factoryName || 'Factory'}</h2>
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
              <>
                {/* Baugruppen Menüpunkt */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('viewChanged', { detail: 'baugruppen' }))
                    }}
                    className="font-semibold"
                  >
                    <Box className="mr-2 h-4 w-4" />
                    <span>Baugruppen</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Kapazität Menüpunkt */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('viewChanged', { detail: 'kapazitaet' }))
                    }}
                    className="font-semibold"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Kapazität</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Produkte Menüpunkt mit Untermenüs */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => toggleSection('produkte')}
                    className="font-semibold"
                  >
                    <ChevronRight 
                      className={`mr-2 h-4 w-4 transition-transform ${
                        expandedSections.has('produkte') ? 'rotate-90' : ''
                      }`}
                    />
                    <span>Produkte</span>
                  </SidebarMenuButton>
                  {expandedSections.has('produkte') && (
                    <SidebarMenuSub>
                      {produkte.map((produkt) => (
                        <SidebarMenuSubItem key={produkt.id}>
                          <SidebarMenuSubButton
                            onClick={() => {
                              toggleProduct(produkt.id)
                              window.dispatchEvent(new CustomEvent('produktSelected', { detail: produkt.id }))
                            }}
                            className="font-medium"
                          >
                            <ChevronRight 
                              className={`mr-2 h-4 w-4 transition-transform ${
                                expandedProducts.has(produkt.id) ? 'rotate-90' : ''
                              }`}
                            />
                            <span>{produkt.bezeichnung}</span>
                          </SidebarMenuSubButton>
                          {expandedProducts.has(produkt.id) && (
                            <SidebarMenuSub>
                              {produkt.varianten.map((variante) => (
                                <SidebarMenuSubItem key={variante.id}>
                                  <SidebarMenuSubButton
                                    onClick={() => handleVarianteClick(variante.id)}
                                    isActive={selectedVariante === variante.id}
                                    className="cursor-pointer pl-8"
                                  >
                                    <span className="text-sm">{variante.bezeichnung}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      ({variante.typ})
                                    </span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}