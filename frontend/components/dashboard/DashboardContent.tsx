"use client"

import { useEffect, useState, useCallback } from "react"
import {
  MessageSquare, Mic, Zap, Activity, Clock, CheckCircle, AlertCircle,
  ExternalLink, RefreshCw, Music, FolderOpen, ChevronRight
} from "lucide-react"
import Link from "next/link"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Session {
  session_id: string
  title: string
  created_at: string
  last_modified: string
  folder_id: string
}

interface ActivityEvent {
  timestamp: string
  type: string
  data: Record<string, any>
}

interface ActivePrompt {
  id: string
  type: string
  name: string
  content: string
  state: string
}

interface DashboardConfig {
  widgets: {
    recent_sessions: boolean
    active_prompts: boolean
    activity_feed: boolean
    recordings: boolean
    task_list: boolean
  }
  task_list?: string[]     // List of tasks the model manages
  notes?: string           // Model-editable notes
  exclude_first_task?: boolean  // Skip first task when online/offline
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  prompt_activated:   <Zap className="w-3.5 h-3.5 text-blue-400" />,
  prompt_deactivated: <Zap className="w-3.5 h-3.5 text-white/25" />,
  off_topic_request:  <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />,
  recording_created:  <Music className="w-3.5 h-3.5 text-purple-400" />,
  session_created:    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  time_warning:       <Clock className="w-3.5 h-3.5 text-orange-400" />,
  model_error:        <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
}

const EVENT_LABELS: Record<string, string> = {
  prompt_activated:   "Prompt Activated",
  prompt_deactivated: "Prompt Deactivated",
  off_topic_request:  "Off-Topic Request",
  prompt_violation:   "Prompt Violation",
  recording_created:  "Recording Created",
  session_created:    "Session Created",
  session_archived:   "Session Archived",
  time_warning:       "Time Warning",
  model_error:        "Model Error",
}

const PROMPT_COLORS: Record<string, string> = {
  task:           "bg-blue-500/15 text-blue-300 border-blue-500/20",
  learn:          "bg-purple-500/15 text-purple-300 border-purple-500/20",
  roles:          "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  time_target:    "bg-orange-500/15 text-orange-300 border-orange-500/20",
  schedule:       "bg-green-500/15 text-green-300 border-green-500/20",
  debate:         "bg-red-500/15 text-red-300 border-red-500/20",
  interview:      "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  forbidden_words:"bg-pink-500/15 text-pink-300 border-pink-500/20",
  read:           "bg-teal-500/15 text-teal-300 border-teal-500/20",
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function DashboardContent() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [prompts, setPrompts] = useState<ActivePrompt[]>([])
  const [config, setConfig] = useState<DashboardConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const load = useCallback(async () => {
    try {
      setLoading(true)

      // Load dashboard config
      const configRes = await fetch(`${API_BASE}/v1/dashboard`)
      if (configRes.ok) {
        const cfgData = await configRes.json()
        setConfig(cfgData)
      }

      // Load recent sessions
      const sessRes = await fetch(`${API_BASE}/v1/sessions`)
      if (sessRes.ok) {
        const all: Session[] = await sessRes.json()
        // Sort by last_modified desc, take top 8
        setSessions(
          [...all]
            .sort((a, b) => new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime())
            .slice(0, 8)
        )

        // Load activity from first session (global aggregate not available yet)
        if (all.length > 0) {
          const actRes = await fetch(`${API_BASE}/v1/sessions/${all[0].session_id}/activity?limit=20`)
          if (actRes.ok) {
            const actData = await actRes.json()
            setActivity(actData.activity || [])
          }

          // Load prompts from first session
          const promptsRes = await fetch(`${API_BASE}/v1/sessions/${all[0].session_id}/prompts`)
          if (promptsRes.ok) {
            const pData = await promptsRes.json()
            setPrompts(pData.active_prompts || [])
          }
        }
      }
    } catch (err) {
      console.error("Dashboard load error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  // Compute task list, excluding first if config says so
  const taskList = config?.task_list ?? []
  const displayedTasks = config?.exclude_first_task && taskList.length > 0
    ? taskList.slice(1)
    : taskList

  const widgets = config?.widgets ?? {
    recent_sessions: true,
    active_prompts: true,
    activity_feed: true,
    recordings: true,
    task_list: true,
  }

  return (
    <div className="space-y-6">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white/90">Overview</h1>
          <p className="text-xs text-white/30 mt-0.5">Your LocalAgent command center</p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/75 text-xs transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Model notes (if set) */}
      {config?.notes && (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white/60 italic">
          💡 {config.notes}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column: Recent Sessions + Task List */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Sessions */}
          {widgets.recent_sessions && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-white/30" />
                  <h2 className="text-sm font-medium text-white/75">Recent Sessions</h2>
                </div>
                <Link
                  href="/dashboard/sessions"
                  className="text-[11px] text-white/30 hover:text-white/60 flex items-center gap-1 transition-all"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {loading ? (
                <div className="px-5 py-8 text-center text-xs text-white/25">Loading…</div>
              ) : sessions.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-white/25">No sessions yet</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {sessions.map((session) => (
                    <Link
                      key={session.session_id}
                      href={`/?session=${session.session_id}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.03] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-3.5 h-3.5 text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/75 group-hover:text-white/90 truncate transition-all">
                          {session.title}
                        </p>
                        <p className="text-[10px] text-white/25">{formatRelative(session.last_modified)}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 shrink-0 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Model-Owned Task List */}
          {widgets.task_list && taskList.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white/30" />
                  <h2 className="text-sm font-medium text-white/75">Model Task List</h2>
                  {config?.exclude_first_task && (
                    <span className="text-[10px] text-yellow-400/70 bg-yellow-400/8 px-1.5 py-0.5 rounded-full border border-yellow-400/15">
                      First excluded (online/offline)
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-white/25">{displayedTasks.length} tasks</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {displayedTasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-5 h-5 rounded border border-white/10 bg-white/3 flex items-center justify-center shrink-0">
                      <span className="text-[9px] text-white/30">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-white/60">{task}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Active Prompts + Activity Feed */}
        <div className="space-y-6">

          {/* Active Prompts */}
          {widgets.active_prompts && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
                <Zap className="w-4 h-4 text-white/30" />
                <h2 className="text-sm font-medium text-white/75">Active Prompts</h2>
              </div>

              {loading ? (
                <div className="px-5 py-6 text-center text-xs text-white/25">Loading…</div>
              ) : prompts.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <Zap className="w-6 h-6 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/25">No active prompts</p>
                  <Link
                    href="/"
                    className="text-[11px] text-blue-400/60 hover:text-blue-400 mt-2 inline-block transition-all"
                  >
                    Create one in Chat →
                  </Link>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {prompts.map((p) => (
                    <div
                      key={p.id}
                      className={`px-3 py-2.5 rounded-lg border text-xs ${
                        PROMPT_COLORS[p.type] ?? "bg-white/5 text-white/50 border-white/10"
                      }`}
                    >
                      <div className="font-medium mb-0.5">{p.name}</div>
                      <div className="opacity-60 truncate">{p.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Feed */}
          {widgets.activity_feed && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
                <Activity className="w-4 h-4 text-white/30" />
                <h2 className="text-sm font-medium text-white/75">Recent Activity</h2>
              </div>

              {loading ? (
                <div className="px-5 py-6 text-center text-xs text-white/25">Loading…</div>
              ) : activity.length === 0 ? (
                <div className="px-5 py-6 text-center text-xs text-white/25">
                  No activity yet
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {activity.slice(0, 10).map((event, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-3">
                      <div className="shrink-0 mt-0.5">
                        {EVENT_ICONS[event.type] ?? <Activity className="w-3.5 h-3.5 text-white/20" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/60">
                          {EVENT_LABELS[event.type] ?? event.type.replace(/_/g, " ")}
                        </p>
                        {event.data?.prompt_name && (
                          <p className="text-[10px] text-white/30 truncate">{event.data.prompt_name}</p>
                        )}
                        {event.data?.user_message && (
                          <p className="text-[10px] text-white/30 truncate">{event.data.user_message?.slice(0, 40)}</p>
                        )}
                      </div>
                      <p className="text-[10px] text-white/20 shrink-0">{formatRelative(event.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
