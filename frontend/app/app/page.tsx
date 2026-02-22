"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bot, Activity, FileText, Mic, Lock, Link2, Settings,
  LayoutDashboard, BarChart3, Monitor, Brain, ChevronRight,
  Loader2, MessageSquare
} from "lucide-react"
import ActionSearchBar from "@/components/ActionSearchBar"
import RemoteChat from "@/components/RemoteChat"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface DashboardStats {
  totalSessions: number
  totalMessages: number
  totalRecordings: number
  activePrompts: number
}

type ActiveView = "overview" | "sessions" | "prompts" | "recordings" | "activity" | "settings" | "secrets" | "links" | "monitoring" | "typing-game"

export default function MainApp() {
  const router = useRouter()
  const [chatOpen, setChatOpen] = useState(false)
  const [activeView, setActiveView] = useState<ActiveView>("overview")
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0, totalMessages: 0, totalRecordings: 0, activePrompts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState<"ok" | "error" | "loading">("loading")

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([
          fetch(`${API_BASE}/v1/dashboard/stats`),
          fetch(`${API_BASE}/health`),
        ])
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }
        if (healthRes.ok) {
          setHealthStatus("ok")
        }
      } catch {
        setHealthStatus("error")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // ⌘K toggles chat
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setChatOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const handleNavigate = useCallback((route: string) => {
    if (route === "typing-game") {
      // Could open a modal or navigate
      setActiveView(route as ActiveView)
    } else {
      setActiveView(route as ActiveView)
    }
  }, [])

  const statCards = [
    { label: "Sessions", value: stats.totalSessions, icon: <FileText className="w-4 h-4" />, view: "sessions" as ActiveView },
    { label: "Messages", value: stats.totalMessages, icon: <MessageSquare className="w-4 h-4" />, view: "overview" as ActiveView },
    { label: "Recordings", value: stats.totalRecordings, icon: <Mic className="w-4 h-4" />, view: "recordings" as ActiveView },
    { label: "Active Prompts", value: stats.activePrompts, icon: <Brain className="w-4 h-4" />, view: "prompts" as ActiveView },
  ]

  const quickActions = [
    { label: "Sessions", icon: <FileText className="w-5 h-5" />, view: "sessions" as ActiveView, desc: "Manage conversations" },
    { label: "Prompts", icon: <Brain className="w-5 h-5" />, view: "prompts" as ActiveView, desc: "9 prompt types" },
    { label: "Recordings", icon: <Mic className="w-5 h-5" />, view: "recordings" as ActiveView, desc: "Voice recordings" },
    { label: "Activity", icon: <Activity className="w-5 h-5" />, view: "activity" as ActiveView, desc: "Smart event log" },
    { label: "Secrets", icon: <Lock className="w-5 h-5" />, view: "secrets" as ActiveView, desc: "API keys & passwords" },
    { label: "Links", icon: <Link2 className="w-5 h-5" />, view: "links" as ActiveView, desc: "Link Bio manager" },
    { label: "Monitoring", icon: <Monitor className="w-5 h-5" />, view: "monitoring" as ActiveView, desc: "Real-time tracking" },
    { label: "Settings", icon: <Settings className="w-5 h-5" />, view: "settings" as ActiveView, desc: "Configuration" },
  ]

  return (
    <div className="h-screen w-full bg-[#080808] overflow-hidden flex flex-col">
      {/* Top bar with Action Search */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white/50">LA</span>
            </div>
          </Link>
          <div className="h-4 w-px bg-white/[0.06]" />
          <span className="text-xs text-white/20 uppercase tracking-widest">{activeView}</span>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <ActionSearchBar
            onNavigate={handleNavigate}
            onToggleChat={() => setChatOpen((v) => !v)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03]">
            <div className={`w-1.5 h-1.5 rounded-full ${
              healthStatus === "ok" ? "bg-green-500/60" :
              healthStatus === "error" ? "bg-red-500/60" : "bg-yellow-500/60 animate-pulse"
            }`} />
            <span className="text-[10px] text-white/25">
              {healthStatus === "ok" ? "Connected" : healthStatus === "error" ? "Offline" : "..."}
            </span>
          </div>

          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen((v) => !v)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              chatOpen
                ? "bg-white/[0.1] text-white/60"
                : "text-white/25 hover:text-white/50 hover:bg-white/[0.06]"
            }`}
          >
            <Bot className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto scrollbar-none">
        {activeView === "overview" && (
          <div className="max-w-5xl mx-auto px-8 py-10">
            {/* Welcome */}
            <div className="mb-10">
              <h1 className="text-2xl font-medium text-white/70 mb-2">Dashboard</h1>
              <p className="text-sm text-white/25">Your AI agent, running locally. Full autonomy. Zero limits.</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 mb-10">
              {statCards.map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => setActiveView(stat.view)}
                  className="px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/20 group-hover:text-white/35 transition-colors">{stat.icon}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/25 transition-colors" />
                  </div>
                  <p className="text-2xl font-mono text-white/50 mb-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : stat.value}
                  </p>
                  <p className="text-xs text-white/20">{stat.label}</p>
                </button>
              ))}
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-10">
              <h2 className="text-sm text-white/25 uppercase tracking-widest mb-4">Quick Actions</h2>
              <div className="grid grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setActiveView(action.view)}
                    className="flex flex-col items-center gap-3 px-4 py-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all group"
                  >
                    <span className="text-white/20 group-hover:text-white/40 transition-colors">{action.icon}</span>
                    <div className="text-center">
                      <p className="text-sm text-white/50 group-hover:text-white/70 font-medium transition-colors">{action.label}</p>
                      <p className="text-[10px] text-white/15 mt-0.5">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* System info */}
            <div className="px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-4 text-[11px] text-white/15">
                <span>LocalAgent v1.0</span>
                <span>•</span>
                <span>Backend: localhost:8000</span>
                <span>•</span>
                <span>Frontend: localhost:3002</span>
                <span>•</span>
                <span>Press ⌘K for actions</span>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard sub-views navigate to existing dashboard pages */}
        {activeView !== "overview" && (
          <div className="max-w-5xl mx-auto px-8 py-10">
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setActiveView("overview")}
                className="text-xs text-white/25 hover:text-white/50 transition-colors"
              >
                ← Back
              </button>
              <span className="text-xs text-white/10">/</span>
              <span className="text-sm text-white/40 capitalize">{activeView}</span>
            </div>

            {/* Embed existing dashboard pages via iframe or dynamic import */}
            <div className="rounded-xl border border-white/[0.05] overflow-hidden bg-white/[0.01] min-h-[60vh]">
              {activeView === "sessions" && (
                <iframe
                  src="/dashboard/sessions"
                  className="w-full h-[70vh] border-0"
                />
              )}
              {activeView === "prompts" && (
                <iframe
                  src="/dashboard/prompts"
                  className="w-full h-[70vh] border-0"
                />
              )}
              {activeView === "recordings" && (
                <iframe
                  src="/dashboard/recordings"
                  className="w-full h-[70vh] border-0"
                />
              )}
              {activeView === "activity" && (
                <iframe
                  src="/dashboard/activity"
                  className="w-full h-[70vh] border-0"
                />
              )}
              {activeView === "settings" && (
                <iframe
                  src="/dashboard/settings"
                  className="w-full h-[70vh] border-0"
                />
              )}
              {(activeView === "secrets" || activeView === "links" || activeView === "monitoring" || activeView === "typing-game") && (
                <div className="flex items-center justify-center h-[60vh]">
                  <div className="text-center space-y-4">
                    <p className="text-white/30 text-sm capitalize">{activeView}</p>
                    <p className="text-white/15 text-xs">Coming soon — use ⌘K chat to interact</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Remote Chat Overlay */}
      <RemoteChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onToggle={() => setChatOpen((v) => !v)}
      />
    </div>
  )
}
