"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle, Zap, Clock, Music } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface ActivityEvent {
  timestamp: string
  type: string
  data: Record<string, any>
}

interface ActivityLogProps {
  sessionId: string
  onClose: () => void
}

export default function ActivityLog({ sessionId, onClose }: ActivityLogProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    loadActivity()
    const interval = setInterval(loadActivity, 5000) // Auto-refresh every 5s
    return () => clearInterval(interval)
  }, [sessionId])

  const loadActivity = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/activity?limit=50`)
      const data = await res.json()
      setEvents(data.activity || [])
    } catch (err) {
      console.error("Error loading activity:", err)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      prompt_activated: <Zap className="w-4 h-4 text-blue-400" />,
      prompt_deactivated: <X className="w-4 h-4 text-white/40" />,
      off_topic_request: <AlertCircle className="w-4 h-4 text-yellow-400" />,
      prompt_violation: <AlertCircle className="w-4 h-4 text-red-400" />,
      recording_created: <Music className="w-4 h-4 text-purple-400" />,
      session_created: <CheckCircle className="w-4 h-4 text-green-400" />,
      session_archived: <X className="w-4 h-4 text-white/40" />,
      time_warning: <Clock className="w-4 h-4 text-orange-400" />,
      model_error: <AlertCircle className="w-4 h-4 text-red-500" />,
    }
    return icons[type] || <AlertCircle className="w-4 h-4 text-white/40" />
  }

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      prompt_activated: "Prompt Activated",
      prompt_deactivated: "Prompt Deactivated",
      off_topic_request: "Off-Topic Request",
      prompt_violation: "Prompt Violation",
      recording_created: "Recording Created",
      session_created: "Session Created",
      session_archived: "Session Archived",
      time_warning: "Time Warning",
      model_error: "Model Error",
      role_switched: "Role Switched",
    }
    return labels[type] || type.replace(/_/g, " ")
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const filteredEvents = filter ? events.filter((e) => e.type === filter) : events

  const eventTypes = [...new Set(events.map((e) => e.type))]

  return (
    <div className="w-96 bg-[#0a0a0a] border-l border-white/5 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white/85">Activity Log</h2>
          <p className="text-xs text-white/30 mt-1">Important events only</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter buttons */}
      <div className="px-4 pt-3 pb-2 border-b border-white/5 space-y-2 max-h-24 overflow-y-auto scrollbar-none">
        <button
          onClick={() => setFilter(null)}
          className={`px-2 py-1 rounded-full text-xs transition-all ${
            filter === null
              ? "bg-white/15 text-white/85"
              : "bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10"
          }`}
        >
          All
        </button>
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-2 py-1 rounded-full text-xs transition-all inline-block ${
              filter === type
                ? "bg-white/15 text-white/85"
                : "bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10"
            }`}
          >
            {getEventLabel(type)}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {loading ? (
          <p className="text-xs text-white/30 px-2 py-4">Loading...</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-xs text-white/30 px-2 py-4">
            {filter ? "No events of this type" : "No activity yet"}
          </p>
        ) : (
          filteredEvents.map((event, i) => (
            <div key={i} className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all">
              {/* Event header */}
              <div className="flex items-start gap-2.5">
                <div className="shrink-0 mt-1">{getEventIcon(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-xs font-medium text-white/75">{getEventLabel(event.type)}</p>
                    <p className="text-[10px] text-white/30">{formatTime(event.timestamp)}</p>
                  </div>

                  {/* Event details */}
                  {event.data && (
                    <div className="text-xs text-white/50 mt-1.5 space-y-1">
                      {event.type === "off_topic_request" && (
                        <>
                          <p>
                            <span className="text-white/60">Message:</span> {event.data.user_message?.slice(0, 50)}
                            {event.data.user_message?.length > 50 ? "..." : ""}
                          </p>
                          <p>
                            <span className="text-white/60">Active:</span> {event.data.active_prompt}
                          </p>
                        </>
                      )}

                      {event.type === "prompt_activated" && (
                        <>
                          <p>
                            <span className="text-white/60">Prompt:</span> {event.data.prompt_name}
                          </p>
                          <p>
                            <span className="text-white/60">Type:</span> {event.data.prompt_type}
                          </p>
                        </>
                      )}

                      {event.type === "recording_created" && (
                        <>
                          <p>
                            <span className="text-white/60">Length:</span> {event.data.text_length} chars
                          </p>
                          <p>
                            <span className="text-white/60">Language:</span> {event.data.language}
                          </p>
                        </>
                      )}

                      {event.type === "model_error" && (
                        <p className="text-red-400/80">{event.data.message}</p>
                      )}

                      {event.type === "prompt_violation" && (
                        <p>
                          <span className="text-white/60">Violation:</span> {event.data.description}
                        </p>
                      )}

                      {event.type === "time_warning" && (
                        <p className="text-orange-400/80">
                          <span className="text-white/60">Time remaining:</span> {event.data.time_remaining}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
