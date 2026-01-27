import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Shapes,
  HelpCircle,
  Image,
  Wrench,
  Database,
  FileOutput,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: { title: string; href: string }[]
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Patterns',
    href: '/patterns',
    icon: Shapes,
    children: [
      { title: 'All Patterns', href: '/patterns' },
      { title: 'New Pattern', href: '/patterns/new' },
    ],
  },
  {
    title: 'Questions',
    href: '/questions',
    icon: HelpCircle,
    children: [
      { title: 'All Questions', href: '/questions' },
      { title: 'New Question', href: '/questions/new' },
    ],
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: Image,
    children: [
      { title: 'All Templates', href: '/templates' },
      { title: 'New Template', href: '/templates/new' },
    ],
  },
  {
    title: 'Tools',
    href: '/tools',
    icon: Wrench,
    children: [
      { title: 'Photo Import', href: '/tools/photo-import' },
      { title: 'Embeddings', href: '/tools/embeddings' },
      { title: 'Export', href: '/tools/export' },
    ],
  },
]

function NavSection({ item }: { item: NavItem }) {
  const location = useLocation()
  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  const [isExpanded, setIsExpanded] = useState(isActive)

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            {item.title}
          </span>
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
          />
        </button>
        {isExpanded && (
          <div className="ml-7 space-y-1 border-l pl-3">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )
                }
              >
                {child.title}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
        )
      }
    >
      <item.icon className="h-4 w-4" />
      {item.title}
    </NavLink>
  )
}

export function StudioLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
              J
            </div>
            <span className="text-lg font-semibold">Jeet Studio</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="space-y-1 p-4">
            {navigation.map((item) => (
              <NavSection key={item.href} item={item} />
            ))}
          </nav>
          <Separator className="my-4" />
          <div className="p-4 space-y-1">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <Database className="h-4 w-4" />
              Backend API
            </a>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <FileOutput className="h-4 w-4" />
              Jeet Frontend
            </a>
          </div>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Jeet Studio</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
