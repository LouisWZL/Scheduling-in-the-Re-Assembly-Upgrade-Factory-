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
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        {icon}
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="rounded-md border overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[65%]">Aufgabe</TableHead>
                <TableHead className="w-[35%] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[180px] truncate" title={item.header}>
                    {item.header}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === "Done"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-xs text-muted-foreground">
            Seite {currentPage} von {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3" />
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
      <SidebarHeader>
        <h2 className="text-lg font-semibold px-2">Auftragsübersicht</h2>
      </SidebarHeader>
      <SidebarContent className="gap-0">
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