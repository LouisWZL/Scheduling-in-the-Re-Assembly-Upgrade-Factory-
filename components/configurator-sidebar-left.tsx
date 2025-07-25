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
import { Badge } from '@/components/ui/badge'

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
  const [selectedProdukt, setSelectedProdukt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [factoryName, setFactoryName] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['produkte']))
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProdukte()
  }, [factoryId])

  useEffect(() => {
    // Expand all products by default
    if (produkte.length > 0) {
      setExpandedProducts(new Set(produkte.map(p => p.id)))
    }
  }, [produkte])

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
                          <div className="relative">
                            <SidebarMenuSubButton
                              onClick={() => {
                                setSelectedProdukt(produkt.id)
                                setSelectedVariante(null)
                                window.dispatchEvent(new CustomEvent('produktSelected', { detail: produkt.id }))
                              }}
                              isActive={selectedProdukt === produkt.id && !selectedVariante}
                              className="font-medium pr-8"
                            >
                              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{produkt.bezeichnung}</span>
                            </SidebarMenuSubButton>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleProduct(produkt.id)
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-sm"
                            >
                              <ChevronRight 
                                className={`h-3 w-3 transition-transform text-muted-foreground ${
                                  expandedProducts.has(produkt.id) ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          </div>
                          {expandedProducts.has(produkt.id) && (
                            <div className="ml-6 border-l pl-2">
                              {produkt.varianten.map((variante) => (
                                <SidebarMenuSubButton
                                  key={variante.id}
                                  onClick={() => {
                                    handleVarianteClick(variante.id)
                                    setSelectedProdukt(null)
                                  }}
                                  isActive={selectedVariante === variante.id}
                                  className="cursor-pointer py-1.5 text-sm"
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="text-muted-foreground">{variante.bezeichnung}</span>
                                    <Badge variant="outline" className="text-xs ml-2">
                                      {variante.typ}
                                    </Badge>
                                  </div>
                                </SidebarMenuSubButton>
                              ))}
                            </div>
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