'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar'

export function ConfiguratorSidebarRight() {
  return (
    <Sidebar 
      side="right" 
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
    >
      <SidebarHeader className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Details</h2>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4 text-sm text-muted-foreground">
          <p>Weitere Details und Optionen werden hier angezeigt.</p>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}