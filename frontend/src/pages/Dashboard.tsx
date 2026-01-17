import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function Dashboard() {
  return (
    <SidebarProvider className="h-screen flex flex-col overflow-hidden">
      <SiteHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-0 !min-h-[unset] overflow-hidden">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

// Re-export DashboardHome from dedicated file
export { DashboardHome } from "./DashboardHome"
