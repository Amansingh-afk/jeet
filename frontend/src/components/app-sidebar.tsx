"use client"

import * as React from "react"
import { Check, ChevronsUpDown, GraduationCap } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { sidebarConfig } from "@/config/sidebar"

const exams = [
  { value: "ssc-cgl", label: "SSC CGL" },
  { value: "ssc-chsl", label: "SSC CHSL" },
  { value: "ssc-mts", label: "SSC MTS" },
  { value: "ssc-gd", label: "SSC GD" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [selectedExam, setSelectedExam] = React.useState(exams[0])

  return (
    <Sidebar
      className="top-14 h-[calc(100svh-3.5rem)]"
      {...props}
    >
      <SidebarHeader>
        {/* Jeet Logo */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-yellow-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <span className="text-xl font-bold">Jeet</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Exam Selector */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{selectedExam.label}</span>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
                {exams.map((exam) => (
                  <DropdownMenuItem
                    key={exam.value}
                    onClick={() => setSelectedExam(exam)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{exam.label}</span>
                    {selectedExam.value === exam.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarConfig.navMain} />
        <NavSecondary items={sidebarConfig.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
