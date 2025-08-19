'use client'

import { SidebarLeft } from "@/components/sidebar-left"
import { SidebarRight } from "@/components/sidebar-right"
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { OrdersTable } from '@/components/orders-table'
import { OrderProvider } from '@/contexts/order-context'
import { OrderGraphViewer } from '@/components/order-graph-viewer'
import { OrderProcessGraphViewer } from '@/components/order-process-graph-viewer'
import { useOrder } from '@/contexts/order-context'
import { Skeleton } from '@/components/ui/skeleton'

import data from "./data.json"

function HomeContent() {
  const { selectedOrder, isLoadingOrder } = useOrder()
  
  return (
    <div className="flex h-screen flex-col [--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex h-full flex-col">
        <SiteHeader />
        <div className="flex flex-1 overflow-hidden [&_[data-slot=sidebar]]:h-full">
          <SidebarLeft />
          <SidebarInset className="overflow-auto">
            <div className="flex flex-1 flex-col gap-4 p-4">
              {isLoadingOrder ? (
                // Skeleton während des Ladens anzeigen
                <>
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                </>
              ) : (
                // Normale Anzeige
                <>
                  <OrdersTable data={data} />
                  <OrderGraphViewer order={selectedOrder} />
                  <OrderProcessGraphViewer order={selectedOrder} />
                </>
              )}
            </div>
          </SidebarInset>
          <SidebarRight />
        </div>
      </SidebarProvider>
    </div>
  )
}

export default function Home() {
  return (
    <OrderProvider>
      <HomeContent />
    </OrderProvider>
  )
}
