import {
  BookOpen,
  TrendingUp,
  History,
  Sparkles,
  Target,
  Settings,
  HelpCircle,
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
      title: "Ask Jeet",
      url: "/dashboard/ask",
      icon: Sparkles,
      isActive: true,
      badge: "AI",
    },
    {
      title: "Practice",
      url: "/dashboard/practice",
      icon: Target,
      items: [
        {
          title: "Daily Challenge",
          url: "/dashboard/practice/daily",
        },
        {
          title: "Quick Practice",
          url: "/dashboard/practice/quick",
        },
        {
          title: "PYQ Papers",
          url: "/dashboard/practice/pyq",
        },
      ],
    },
    {
      title: "Topics",
      url: "/dashboard/topics",
      icon: BookOpen,
      items: [
        {
          title: "All Topics",
          url: "/dashboard/topics",
        },
        {
          title: "Arithmetic",
          url: "/dashboard/topics/arithmetic",
        },
        {
          title: "Algebra",
          url: "/dashboard/topics/algebra",
        },
        {
          title: "Geometry",
          url: "/dashboard/topics/geometry",
        },
      ],
    },
    {
      title: "My Progress",
      url: "/dashboard/progress",
      icon: TrendingUp,
      items: [
        {
          title: "Overview",
          url: "/dashboard/progress",
        },
        {
          title: "Tricks Learned",
          url: "/dashboard/progress/tricks",
        },
        {
          title: "Weak Areas",
          url: "/dashboard/progress/weak",
        },
      ],
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
