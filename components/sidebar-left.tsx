"use client"

import * as React from "react"
import {
  Phone,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
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
import data from "@/app/data.json"

interface TableData {
  id: number
  header: string
  status: string
}

function PaginatedTable({
  title,
  icon,
  data,
}: {
  title: string
  icon: React.ReactNode
  data: TableData[]
}) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <SidebarGroup className="px-3 py-2">
      <SidebarGroupLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 mb-2">
        {icon}
        <span>{title}</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[65%] h-9 text-xs font-medium text-muted-foreground">Aufgabe</TableHead>
                <TableHead className="w-[35%] h-9 text-right text-xs font-medium text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                  <TableCell className="py-2 px-3" title={item.header}>
                    <span className="text-sm truncate block max-w-[180px]">
                      {item.header}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex justify-end">
                      <Badge variant="outline" className="text-muted-foreground px-1.5 inline-flex items-center gap-1">
                        {item.status === "Done" ? (
                          <IconCircleCheckFilled className="h-3.5 w-3.5 fill-green-500 dark:fill-green-400" />
                        ) : (
                          <IconLoader className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs">{item.status}</span>
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // Prepare data for the three tables
  const erstkontaktData = data.slice(0, 20).map((item) => ({
    id: item.id,
    header: item.header,
    status: item.status,
  }))

  const grobterminierungData = data.slice(20, 40).map((item) => ({
    id: item.id,
    header: item.header,
    status: item.status,
  }))

  const feinterminierungData = data.slice(40, 60).map((item) => ({
    id: item.id,
    header: item.header,
    status: item.status,
  }))

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
      <SidebarContent className="gap-2 py-2">
        <PaginatedTable
          title="Erstkontakt"
          icon={<Phone className="h-4 w-4" />}
          data={erstkontaktData}
        />
        <PaginatedTable
          title="Grobterminierung"
          icon={<Calendar className="h-4 w-4" />}
          data={grobterminierungData}
        />
        <PaginatedTable
          title="Feinterminierung"
          icon={<CalendarCheck className="h-4 w-4" />}
          data={feinterminierungData}
        />
      </SidebarContent>
    </Sidebar>
  )
}