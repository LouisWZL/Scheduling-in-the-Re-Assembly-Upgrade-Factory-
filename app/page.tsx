import { SidebarLeft } from "@/components/sidebar-left"
import { SidebarRight } from "@/components/sidebar-right"
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { OrdersTable } from '@/components/orders-table'

import data from "./data.json"

export default function Home() {
  return (
    <div className="flex h-screen flex-col [--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex h-full flex-col">
        <SiteHeader />
        <div className="flex flex-1 overflow-hidden [&_[data-slot=sidebar]]:h-full">
          <SidebarLeft />
          <SidebarInset className="overflow-auto">
            <div className="flex flex-1 flex-col gap-4 p-4">
            <OrdersTable data={data} />
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
              </div>
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
            </div>
          </SidebarInset>
          <SidebarRight />
        </div>
      </SidebarProvider>
    </div>
  )
}
