import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { BottomNav } from "@/components/bottom-nav"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function Dashboard() {
  const isMobile = useIsMobile()

  return (
    <SidebarProvider className="h-screen flex flex-col overflow-hidden">
      <SiteHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar only on desktop */}
        {!isMobile && <AppSidebar />}
        <SidebarInset className="flex flex-col min-h-0 !min-h-[unset] overflow-hidden pb-16 md:pb-0">
          <Outlet />
        </SidebarInset>
      </div>
      {/* Bottom nav only on mobile */}
      {isMobile && <BottomNav />}
    </SidebarProvider>
  )
}

// Re-export DashboardHome from dedicated file
export { DashboardHome } from "./DashboardHome"
