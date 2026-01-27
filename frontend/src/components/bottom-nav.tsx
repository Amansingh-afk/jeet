"use client"

import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, Sparkles, BookOpen, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  icon: React.ElementType
  label: string
  path: string
}

const navItems: NavItem[] = [
  {
    icon: Home,
    label: "Home",
    path: "/dashboard",
  },
  {
    icon: Sparkles,
    label: "Ask",
    path: "/dashboard/ask",
  },
  {
    icon: BookOpen,
    label: "Topics",
    path: "/dashboard/topics",
  },
  {
    icon: Target,
    label: "Practice",
    path: "/dashboard/practice",
  },
]

export function BottomNav() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={active ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
