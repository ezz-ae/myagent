"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Zap,
  Mic,
  Activity,
  Phone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  FolderOpen,
} from "lucide-react"

const navItems = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Overview",    badge: null },
  { href: "/dashboard/sessions",  icon: FolderOpen,      label: "Sessions",    badge: null },
  { href: "/dashboard/prompts",   icon: Zap,             label: "Prompts",     badge: null },
  { href: "/dashboard/recordings",icon: Mic,             label: "Recordings",  badge: null },
  { href: "/dashboard/activity",  icon: Activity,        label: "Activity",    badge: null },
  { href: "/",                    icon: MessageSquare,   label: "Chat",        badge: null },
  { href: "/?tab=call",           icon: Phone,           label: "Calls",       badge: null },
]

const bottomItems = [
  { href: "/dashboard/settings",  icon: Settings,        label: "Settings" },
]

interface DashboardSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export default function DashboardSidebar({ collapsed = false, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={`flex flex-col h-screen bg-[#080808] border-r border-white/5 transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-white/5 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-white/50" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-white/85">LocalAgent</p>
            <p className="text-[10px] text-white/25">Dashboard</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href) && item.href !== "/"
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                active
                  ? "bg-white/10 text-white/90"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              } ${collapsed ? "justify-center px-0 w-10 mx-auto" : ""}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white/80" : "text-white/35 group-hover:text-white/60"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="py-3 px-2 border-t border-white/5 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/35 hover:text-white/60 hover:bg-white/5 transition-all ${
                collapsed ? "justify-center px-0 w-10 mx-auto" : ""
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/5 text-sm transition-all ${
            collapsed ? "justify-center px-0 w-10 mx-auto" : ""
          }`}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4 shrink-0" />
            : <><ChevronLeft className="w-4 h-4 shrink-0" /><span>Collapse</span></>
          }
        </button>
      </div>
    </div>
  )
}
