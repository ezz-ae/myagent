"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Zap, Mic, FolderOpen, TrendingUp, TrendingDown } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface StatCard {
  label: string
  value: string | number
  sub: string
  icon: React.ReactNode
  color: string       // tailwind bg color for icon bg
  textColor: string   // tailwind text color for icon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

interface DashboardStatsProps {
  refreshKey?: number
}

export default function DashboardStats({ refreshKey }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    totalRecordings: 0,
    activePrompts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [refreshKey])

  const loadStats = async () => {
    try {
      setLoading(true)
      // Try to load dashboard stats from backend
      const res = await fetch(`${API_BASE}/v1/dashboard/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        // Fallback: compute from sessions endpoint
        const sessionsRes = await fetch(`${API_BASE}/v1/sessions`)
        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json()
          setStats((prev) => ({ ...prev, totalSessions: sessions.length }))
        }
      }
    } catch (err) {
      console.error("Error loading dashboard stats:", err)
    } finally {
      setLoading(false)
    }
  }

  const cards: StatCard[] = [
    {
      label: "Total Sessions",
      value: loading ? "—" : stats.totalSessions,
      sub: "Persistent conversations",
      icon: <FolderOpen className="w-4 h-4" />,
      color: "bg-blue-500/10",
      textColor: "text-blue-400",
      trend: "neutral",
    },
    {
      label: "Messages Sent",
      value: loading ? "—" : stats.totalMessages,
      sub: "Across all sessions",
      icon: <MessageSquare className="w-4 h-4" />,
      color: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      trend: "up",
      trendValue: "+12%",
    },
    {
      label: "Voice Recordings",
      value: loading ? "—" : stats.totalRecordings,
      sub: "TTS outputs saved",
      icon: <Mic className="w-4 h-4" />,
      color: "bg-purple-500/10",
      textColor: "text-purple-400",
      trend: "neutral",
    },
    {
      label: "Active Prompts",
      value: loading ? "—" : stats.activePrompts,
      sub: "Currently guiding model",
      icon: <Zap className="w-4 h-4" />,
      color: "bg-orange-500/10",
      textColor: "text-orange-400",
      trend: "neutral",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative p-5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all group overflow-hidden"
        >
          {/* Background glow */}
          <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity ${card.color}`} />

          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2 rounded-lg ${card.color}`}>
              <div className={card.textColor}>{card.icon}</div>
            </div>
            {card.trend && card.trend !== "neutral" && card.trendValue && (
              <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                card.trend === "up"
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-red-400 bg-red-400/10"
              }`}>
                {card.trend === "up"
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                {card.trendValue}
              </div>
            )}
          </div>

          {/* Value */}
          <p className="text-3xl font-semibold text-white/90 mb-1 tabular-nums">
            {card.value}
          </p>
          <p className="text-xs font-medium text-white/60">{card.label}</p>
          <p className="text-[10px] text-white/25 mt-0.5">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
