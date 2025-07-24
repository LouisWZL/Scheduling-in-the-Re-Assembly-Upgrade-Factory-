import { ConfiguratorSidebarLeft } from "@/components/configurator-sidebar-left"
import { ConfiguratorSidebarRight } from "@/components/configurator-sidebar-right"
import { ConfiguratorContent } from "@/components/configurator-content"
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function FactoryConfigurator() {
  return (
    <div className="flex h-screen flex-col [--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex h-full flex-col">
        <SiteHeader />
        <div className="flex flex-1 overflow-hidden [&_[data-slot=sidebar]]:h-full">
          <ConfiguratorSidebarLeft />
          <SidebarInset className="overflow-auto">
            <ConfiguratorContent />
          </SidebarInset>
          <ConfiguratorSidebarRight />
        </div>
      </SidebarProvider>
    </div>
  )
}