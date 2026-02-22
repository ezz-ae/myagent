"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import {
  Activity,
  ChevronLeft,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Music,
  X,
} from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface ActivityEvent {
  timestamp: string
  type: string
  data: Record<string, any>
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  prompt_activated: <Zap className="w-4 h-4 text-blue-400" />,
  prompt_deactivated: <X className="w-4 h-4 text-white/25" />,
  off_topic_request: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  prompt_violation: <AlertCircle className="w-4 h-4 text-red-400" />,
  recording_created: <Music className="w-4 h-4 text-purple-400" />,
  session_created: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  session_archived: <X className="w-4 h-4 text-white/25" />,
  time_warning: <Clock className="w-4 h-4 text-orange-400" />,
  model_error: <AlertCircle className="w-4 h-4 text-red-500" />,
}

const EVENT_LABELS: Record<string, string> = {
  prompt_activated: "Prompt Activated",
  prompt_deactivated: "Prompt Deactivated",
  off_topic_request: "Off-Topic Request",
  prompt_violation: "Prompt Violation",
  recording_created: "Recording Created",
  session_created: "Session Created",
  session_archived: "Session Archived",
  time_warning: "Time Warning",
  model_error: "Model Error",
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    loadActivity()
  }, [])

  const loadActivity = async () => {
    try {
      setLoading(true)
      const sessionsRes = await fetch(`${API_BASE}/v1/sessions`)
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json()
        let allEvents: ActivityEvent[] = []

        for (const session of sessions) {
          try {
            const activityRes = await fetch(
              `${API_BASE}/v1/sessions/${session.session_id}/activity?limit=100`
            )
            if (activityRes.ok) {
              const data = await activityRes.json()
              allEvents = [...allEvents, ...(data.activity || [])]
            }
          } catch (err) {
            console.error(`Error loading activity for session ${session.session_id}:`, err)
          }
        }

        setEvents(
          allEvents.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        )
      }
    } catch (err) {
      console.error("Error loading activity:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = filter ? events.filter((e) => e.type === filter) : events
  const eventTypes = [...new Set(events.map((e) => e.type))]

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-white/90">Activity Log</h1>
              <p className="text-xs text-white/30 mt-0.5">{filteredEvents.length} events</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === null
                ? "bg-white/15 text-white/85"
                : "bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10"
            }`}
          >
            All Events ({events.length})
          </button>
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === type
                  ? "bg-white/15 text-white/85"
                  : "bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10"
              }`}
            >
              {EVENT_LABELS[type] || type} ({events.filter((e) => e.type === type).length})
            </button>
          ))}
        </div>

        {/* Events Timeline */}
        <div>
          {loading ? (
            <div className="text-center py-12 text-white/25">Loading activity…</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {EVENT_ICONS[event.type] || <Activity className="w-4 h-4 text-white/40" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="text-xs font-medium text-white/75">
                          {EVENT_LABELS[event.type] || event.type}
                        </p>
                        <p className="text-[10px] text-white/30">
                          {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                        </p>
                      </div>

                      {/* Event details */}
                      {event.data && (
                        <div className="text-xs text-white/50 mt-2 space-y-1">
                          {event.type === "off_topic_request" && (
                            <>
                              <p>
                                <span className="text-white/60">Message:</span>{" "}
                                {event.data.user_message?.slice(0, 80)}
                                {event.data.user_message?.length > 80 ? "..." : ""}
                              </p>
                              <p>
                                <span className="text-white/60">Active Prompt:</span>{" "}
                                {event.data.active_prompt}
                              </p>
                            </>
                          )}

                          {event.type === "prompt_activated" && (
                            <>
                              <p>
                                <span className="text-white/60">Prompt:</span>{" "}
                                {event.data.prompt_name}
                              </p>
                              <p>
                                <span className="text-white/60">Type:</span>{" "}
                                {event.data.prompt_type}
                              </p>
                            </>
                          )}

                          {event.type === "recording_created" && (
                            <>
                              <p>
                                <span className="text-white/60">Length:</span>{" "}
                                {event.data.text_length} chars
                              </p>
                              <p>
                                <span className="text-white/60">Language:</span>{" "}
                                {event.data.language}
                              </p>
                            </>
                          )}

                          {event.type === "model_error" && (
                            <p className="text-red-400/80">{event.data.message}</p>
                          )}

                          {event.type === "time_warning" && (
                            <p className="text-orange-400/80">
                              <span className="text-white/60">Time remaining:</span>{" "}
                              {event.data.time_remaining}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
