"use client"

import * as React from "react"
import {
  Phone,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
} from "lucide-react"
import {
  IconCircleCheckFilled,
  IconLoader,
} from "@tabler/icons-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useFactory } from "@/contexts/factory-context"
import { useOrder } from "@/contexts/order-context"
import { getAuftraege } from "@/app/actions/auftrag.actions"
import { AuftragsPhase } from "@prisma/client"

interface OrderData {
  id: string
  phase: AuftragsPhase
  kunde: {
    vorname: string
    nachname: string
  }
  produktvariante: {
    bezeichnung: string
    typ: string
    produkt?: any
  }
  createdAt: string
  graphData?: any
  baugruppenInstances?: any[]
}

function PaginatedTable({
  title,
  icon,
  data,
  phase,
  onOrderClick,
}: {
  title: string
  icon: React.ReactNode
  data: OrderData[]
  phase: AuftragsPhase
  onOrderClick?: (order: OrderData) => void
}) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5
  
  // Filter data by phase
  const filteredData = data.filter(order => order.phase === phase)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (phase: AuftragsPhase) => {
    switch (phase) {
      case "ABGESCHLOSSEN":
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5 inline-flex items-center gap-1">
            <IconCircleCheckFilled className="h-3.5 w-3.5 fill-green-500 dark:fill-green-400" />
            <span className="text-xs">Fertig</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5 inline-flex items-center gap-1">
            <IconLoader className="h-3.5 w-3.5" />
            <span className="text-xs">In Arbeit</span>
          </Badge>
        )
    }
  }

  return (
    <SidebarGroup className="px-3 py-2">
      <SidebarGroupLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 mb-2">
        {icon}
        <span>{title}</span>
        <span className="ml-auto text-xs">({filteredData.length})</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[65%] h-9 text-xs font-medium text-muted-foreground">Kunde</TableHead>
                <TableHead className="w-[35%] h-9 text-right text-xs font-medium text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => onOrderClick?.(order)}
                  >
                    <TableCell className="py-2 px-3" title={`${order.kunde.vorname} ${order.kunde.nachname} - ${order.produktvariante.bezeichnung}`}>
                      <div className="space-y-0.5">
                        <span className="text-sm truncate block max-w-[180px] font-medium">
                          {order.kunde.vorname} {order.kunde.nachname}
                        </span>
                        <span className="text-xs text-muted-foreground truncate block max-w-[180px]">
                          {order.produktvariante.bezeichnung}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <div className="flex justify-end">
                        {getStatusBadge(order.phase)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="py-4 text-center text-sm text-muted-foreground">
                    Keine Aufträge vorhanden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredData.length > itemsPerPage && (
          <div className="flex items-center justify-between px-2 pt-2">
            <span className="text-xs text-muted-foreground">
              Seite {currentPage} von {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { activeFactory } = useFactory()
  const { setSelectedOrder } = useOrder()
  const [orders, setOrders] = React.useState<OrderData[]>([])
  const [loading, setLoading] = React.useState(true)

  // Load orders when factory changes
  React.useEffect(() => {
    if (activeFactory) {
      loadOrders()
    }
  }, [activeFactory])

  const loadOrders = async () => {
    if (!activeFactory) return
    
    setLoading(true)
    try {
      const result = await getAuftraege(activeFactory.id)
      if (result.success && result.data) {
        setOrders(result.data as any)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Fehler beim Laden der Aufträge')
    } finally {
      setLoading(false)
    }
  }

  const handleOrderClick = (order: OrderData) => {
    setSelectedOrder(order as any)
  }

  // Listen for orders generated event
  React.useEffect(() => {
    const handleOrdersGenerated = () => {
      loadOrders()
    }

    window.addEventListener('ordersGenerated', handleOrdersGenerated)
    return () => {
      window.removeEventListener('ordersGenerated', handleOrdersGenerated)
    }
  }, [activeFactory])

  return (
    <Sidebar 
      collapsible="none" 
      className="border-r" 
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Auftragsübersicht</h2>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-2">
        {loading ? (
          <div className="p-4 space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        ) : (
          <>
            <PaginatedTable
              title="Erstkontakt"
              icon={<Phone className="h-4 w-4" />}
              data={orders}
              phase={AuftragsPhase.ERSTKONTAKT}
              onOrderClick={handleOrderClick}
            />
            
            <div className="flex justify-center py-2">
              <div className="flex flex-col items-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground animate-pulse" />
              </div>
            </div>
            
            <PaginatedTable
              title="Grobterminierung"
              icon={<Calendar className="h-4 w-4" />}
              data={orders}
              phase={AuftragsPhase.GROBTERMINIERUNG}
              onOrderClick={handleOrderClick}
            />
            
            <div className="flex justify-center py-2">
              <div className="flex flex-col items-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground animate-pulse" />
              </div>
            </div>
            
            <PaginatedTable
              title="Feinterminierung"
              icon={<CalendarCheck className="h-4 w-4" />}
              data={orders}
              phase={AuftragsPhase.FEINTERMINIERUNG}
              onOrderClick={handleOrderClick}
            />
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}