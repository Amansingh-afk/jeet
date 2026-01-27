import {
  BookOpen,
  History,
  Sparkles,
  Target,
  Settings,
  HelpCircle,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  badge?: string
  items?: {
    title: string
    url: string
  }[]
}

export interface NavSecondaryItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface SidebarConfig {
  navMain: NavItem[]
  navSecondary: NavSecondaryItem[]
}

export const sidebarConfig: SidebarConfig = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Ask Jeet",
      url: "/dashboard/ask",
      icon: Sparkles,
      badge: "AI",
    },
    {
      title: "Practice",
      url: "/dashboard/practice",
      icon: Target,
    },
    {
      title: "Topics",
      url: "/dashboard/topics",
      icon: BookOpen,
    },
    {
      title: "History",
      url: "/dashboard/history",
      icon: History,
    },
  ],
  navSecondary: [
    {
      title: "Help",
      url: "/dashboard/help",
      icon: HelpCircle,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}
