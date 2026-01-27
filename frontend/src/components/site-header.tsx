"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Bell, LogOut, Settings, SidebarIcon, User, GraduationCap, History, Check } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

const exams = [
  { value: "ssc-cgl", label: "SSC CGL" },
  { value: "ssc-chsl", label: "SSC CHSL" },
  { value: "ssc-mts", label: "SSC MTS" },
  { value: "ssc-gd", label: "SSC GD" },
]

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const isMobile = useIsMobile()
  const [selectedExam, setSelectedExam] = React.useState(exams[0])

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-14 w-full items-center gap-2 px-4">
        {isMobile ? (
          <Link to="/dashboard" className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-yellow-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
          </Link>
        ) : (
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
        )}
        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Home</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
        <Separator orientation="vertical" className="ml-2 h-4" />

        {/* Notification Bell */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/user.jpg" alt="User" />
                <AvatarFallback>ST</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end" forceMount>
            {isMobile && (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <span>{selectedExam.label}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {exams.map((exam) => (
                      <DropdownMenuItem
                        key={exam.value}
                        onClick={() => setSelectedExam(exam)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span>{exam.label}</span>
                        {selectedExam.value === exam.value && (
                          <Check className="ml-2 h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/history" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
