"use client"

import { useAgentStore } from "@/lib/store/agent-store"
import DashboardSidebar from "./DashboardSidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSidebarCollapsed, setSidebarCollapsed } = useAgentStore((state) => ({
    isSidebarCollapsed: state.isSidebarCollapsed,
    setSidebarCollapsed: state.setSidebarCollapsed,
  }))

  return (
    <div className="flex h-screen w-full bg-[#080808]">
      {/* Sidebar */}
      <DashboardSidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-white/5 bg-[#080808]/50 backdrop-blur-lg flex items-center px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-xs text-white/25">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
