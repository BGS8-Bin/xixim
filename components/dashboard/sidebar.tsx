"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { XiximLogo } from "@/components/xixim-logo"
import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  UserCog,
  BookOpen,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  DollarSign,
  FileText,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/auth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  // { name: "Organismos", href: "/dashboard/organismos", icon: Building2 },
  { name: "Empresas", href: "/dashboard/empresas", icon: Users },
  { name: "Admisión de Socios", href: "/dashboard/admision", icon: UserPlus },
  { name: "Pagos", href: "/dashboard/pagos", icon: DollarSign },
  // { name: "Kit de Bienvenida", href: "/dashboard/bienvenida", icon: Gift },
  { name: "Directorio", href: "/directorio", icon: BookOpen },
  { name: "Calendario", href: "/dashboard/calendario", icon: Calendar },
  { name: "Comunicación", href: "/dashboard/comunicacion", icon: MessageSquare },
  { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
  { name: "Usuarios", href: "/dashboard/usuarios", icon: UserCog },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

interface SidebarProps {
  profile: UserProfile
  pendingAdmissionsCount?: number
  pendingPaymentsCount?: number
}

export function Sidebar({ profile, pendingAdmissionsCount = 0, pendingPaymentsCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {collapsed ? (
            <img src="/images/xixim-1.webp" alt="XIXIM" width={32} height={32} className="object-contain" />
          ) : (
            <XiximLogo size="small" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "hidden")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Toggle button when collapsed */}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-2 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            // Determine if this item needs a badge
            let badgeCount = 0
            if (item.href === "/dashboard/admision") badgeCount = pendingAdmissionsCount
            if (item.href === "/dashboard/pagos") badgeCount = pendingPaymentsCount

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? item.name : undefined}
              >
                <div className="relative">
                  <item.icon className={cn("h-5 w-5 shrink-0", collapsed && "h-5 w-5")} />
                  {collapsed && badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between">
                    <span>{item.name}</span>
                    {badgeCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer - Add functional logout button */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed ? "justify-center px-2" : "justify-start gap-3",
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}
