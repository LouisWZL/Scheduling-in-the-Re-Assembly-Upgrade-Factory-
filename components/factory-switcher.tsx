"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Factory, PencilIcon, SaveIcon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useFactory } from "@/contexts/factory-context"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { deleteAllFactoryOrders } from "@/app/actions/factory.actions"

interface FactoryData {
  id: string
  name: string
  kapazität: number
}

export function FactorySwitcher() {
  const { activeFactory, setActiveFactory, factories, setFactories } = useFactory()
  const [loading, setLoading] = React.useState(true)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [newFactoryName, setNewFactoryName] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false)
  const [deletingOrders, setDeletingOrders] = React.useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const isConfigurator = pathname.startsWith('/factory-configurator/')

  React.useEffect(() => {
    fetchFactories()
  }, [])

  React.useEffect(() => {
    if (isConfigurator && pathname.includes('/factory-configurator/')) {
      const urlFactoryId = pathname.split('/').pop()
      if (urlFactoryId && factories.length > 0) {
        const factory = factories.find(f => f.id === urlFactoryId)
        if (factory) {
          setActiveFactory(factory)
        }
      }
    } else if (factories.length > 0 && !activeFactory) {
      setActiveFactory(factories[0])
    }
  }, [pathname, isConfigurator, factories])

  const fetchFactories = async () => {
    try {
      const response = await fetch('/api/factories')
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        console.error('Invalid response format:', data)
        setFactories([])
        setLoading(false)
        return
      }
      
      setFactories(data)
      
      if (data.length > 0 && !activeFactory) {
        if (isConfigurator && pathname.includes('/factory-configurator/')) {
          const urlFactoryId = pathname.split('/').pop()
          const factory = data.find((f: FactoryData) => f.id === urlFactoryId)
          if (factory) {
            setActiveFactory(factory)
          } else {
            setActiveFactory(data[0])
          }
        } else {
          setActiveFactory(data[0])
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching factories:', error)
      setFactories([])
      setLoading(false)
    }
  }

  const handleFactorySelect = (factory: FactoryData) => {
    setActiveFactory(factory)
    if (isConfigurator) {
      router.replace(`/factory-configurator/${factory.id}`)
    }
  }

  const handleCreateFactory = async () => {
    if (!newFactoryName.trim()) {
      toast.error("Bitte geben Sie einen Namen ein")
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/factories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFactoryName.trim(),
          kapazität: 100,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create factory')
      }

      const newFactory = await response.json()
      
      await fetchFactories()
      
      setActiveFactory(newFactory)
      setCreateDialogOpen(false)
      setNewFactoryName("")
      toast.success("Fabrik erfolgreich erstellt")
      
      router.push(`/factory-configurator/${newFactory.id}`)
    } catch (error) {
      console.error('Error creating factory:', error)
      toast.error("Fehler beim Erstellen der Fabrik")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <SidebarMenu className="w-[280px]">
          <SidebarMenuItem>
            <div className="animate-pulse h-12 w-full bg-muted rounded-md" />
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    )
  }

  if (!activeFactory) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <SidebarMenu className="w-[280px]">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
                >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Factory className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{activeFactory.name}</span>
                  <span className="truncate text-xs">Kapazität: {activeFactory.kapazität}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Fabriken
              </DropdownMenuLabel>
              {factories.map((factory, index) => (
                <DropdownMenuItem
                  key={factory.id}
                  onClick={() => handleFactorySelect(factory)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Factory className="size-3.5 shrink-0" />
                  </div>
                  {factory.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 p-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">Fabrik hinzufügen</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          if (isConfigurator) {
            router.push('/')
          } else {
            setConfirmDialogOpen(true)
          }
        }}
      >
        {isConfigurator ? <SaveIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
      </Button>
    </div>

      {/* Confirmation Dialog for Factory Configuration */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent aria-describedby="confirm-dialog-description">
          <DialogHeader>
            <DialogTitle>Factory-Konfiguration öffnen</DialogTitle>
          </DialogHeader>
          <div id="confirm-dialog-description" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong>Achtung:</strong> Durch das Öffnen der Factory-Konfiguration werden:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Die Simulation abgebrochen</li>
              <li>Alle bestehenden Kundenaufträge dieser Factory gelöscht</li>
              <li>Alle zugehörigen Baugruppen-Instanzen entfernt</li>
            </ul>
            <p className="text-sm text-muted-foreground">Möchten Sie wirklich fortfahren?</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false)
              }}
              disabled={deletingOrders}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                setDeletingOrders(true)
                try {
                  const result = await deleteAllFactoryOrders(activeFactory.id)
                  if (result.success) {
                    toast.success("Aufträge wurden gelöscht")
                    router.push(`/factory-configurator/${activeFactory.id}`)
                    setConfirmDialogOpen(false)
                  } else {
                    toast.error(result.error || "Fehler beim Löschen der Aufträge")
                  }
                } catch (error) {
                  console.error('Error deleting orders:', error)
                  toast.error("Fehler beim Löschen der Aufträge")
                } finally {
                  setDeletingOrders(false)
                }
              }}
              disabled={deletingOrders}
            >
              {deletingOrders ? "Lösche Aufträge..." : "Fortfahren"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Factory Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Fabrik erstellen</DialogTitle>
            <DialogDescription>
              Geben Sie einen Namen für die neue Fabrik ein.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newFactoryName}
                onChange={(e) => setNewFactoryName(e.target.value)}
                className="col-span-3"
                placeholder="z.B. Hauptfabrik"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFactory()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setNewFactoryName("")
              }}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={handleCreateFactory}
              disabled={creating || !newFactoryName.trim()}
            >
              {creating ? "Erstelle..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}