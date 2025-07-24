'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar'

export function ConfiguratorSidebarRight() {
  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader>
        <h2 className="px-2 text-lg font-semibold">Details</h2>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4 text-sm text-muted-foreground">
          <p>Weitere Details und Optionen werden hier angezeigt.</p>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}