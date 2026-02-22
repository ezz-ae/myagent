"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Mic, ChevronLeft, Download, Trash2, Play, Square } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Recording {
  id: string
  session_id: string
  timestamp: string
  duration?: number
  text_length?: number
  language?: string
  metadata?: Record<string, any>
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<string | null>(null)

  useEffect(() => {
    loadRecordings()
  }, [])

  const loadRecordings = async () => {
    try {
      setLoading(true)
      const sessionsRes = await fetch(`${API_BASE}/v1/sessions`)
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json()
        let allRecordings: Recording[] = []

        for (const session of sessions) {
          try {
            const recordingsRes = await fetch(
              `${API_BASE}/v1/sessions/${session.session_id}/recordings`
            )
            if (recordingsRes.ok) {
              const data = await recordingsRes.json()
              const sessionRecordings = (data.recordings || []).map((r: any) => ({
                ...r,
                session_id: session.session_id,
              }))
              allRecordings = [...allRecordings, ...sessionRecordings]
            }
          } catch (err) {
            console.error(`Error loading recordings for session ${session.session_id}:`, err)
          }
        }

        setRecordings(
          allRecordings.sort(
            (a, b) =>
              new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime()
          )
        )
      }
    } catch (err) {
      console.error("Error loading recordings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (recordingId: string) => {
    if (playing === recordingId) {
      setPlaying(null)
    } else {
      setPlaying(recordingId)
    }
  }

  const handleDownload = async (sessionId: string, recordingId: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/recordings/${recordingId}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `recording-${recordingId}.mp3`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
              <h1 className="text-2xl font-semibold text-white/90">Voice Recordings</h1>
              <p className="text-xs text-white/30 mt-0.5">{recordings.length} total recordings</p>
            </div>
          </div>
        </div>

        {/* Recordings List */}
        <div>
          {loading ? (
            <div className="text-center py-12 text-white/25">Loading recordings…</div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm">No recordings yet</p>
              <p className="text-white/15 text-xs mt-1">
                Play a response message in Chat to create a recording
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <div
                  key={`${recording.session_id}-${recording.id}`}
                  className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => handlePlay(recording.id)}
                        className="p-2 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 transition-all"
                        title={playing === recording.id ? "Pause" : "Play"}
                      >
                        {playing === recording.id ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-medium text-white/85">
                            Recording {formatDate(recording.timestamp)}
                          </p>
                          {recording.language && (
                            <span className="text-[10px] text-white/30">
                              • {recording.language.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          {recording.text_length && (
                            <p className="text-xs text-white/40">
                              {recording.text_length} chars
                            </p>
                          )}
                          <p className="text-xs text-white/30">{recording.session_id.slice(0, 20)}…</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() =>
                          handleDownload(recording.session_id, recording.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400/40 hover:text-blue-400 transition-all"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/40 hover:text-red-400 transition-all"
                        title="Delete (coming soon)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
