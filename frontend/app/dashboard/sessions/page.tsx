"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { FolderOpen, MessageSquare, Trash2, Edit2, Plus, ChevronLeft, Clock } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Session {
  session_id: string
  folder_id: string
  title: string
  created_at: string
  last_modified: string
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/v1/sessions`)
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sort((a: Session, b: Session) =>
          new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime()
        ))
      }
    } catch (err) {
      console.error("Error loading sessions:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRename = async (sessionId: string) => {
    try {
      await fetch(`${API_BASE}/v1/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      })
      loadSessions()
      setRenaming(null)
    } catch (err) {
      console.error("Error renaming session:", err)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Archive this session? This cannot be undone.")) return

    try {
      await fetch(`${API_BASE}/v1/sessions/${sessionId}`, {
        method: "DELETE",
      })
      loadSessions()
    } catch (err) {
      console.error("Error deleting session:", err)
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
              <h1 className="text-2xl font-semibold text-white/90">Sessions</h1>
              <p className="text-xs text-white/30 mt-0.5">{sessions.length} total sessions</p>
            </div>
          </div>
          <Link
            href="/?newSession=true"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Session
          </Link>
        </div>

        {/* Sessions Grid */}
        <div>
          {loading ? (
            <div className="text-center py-12 text-white/25">Loading sessions…</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm">No sessions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/?session=${session.session_id}`}
                      className="flex-1 flex items-start gap-3 min-w-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0 mt-1">
                        <MessageSquare className="w-4 h-4 text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {renaming === session.session_id ? (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleRename(session.session_id)
                                } else if (e.key === "Escape") {
                                  setRenaming(null)
                                }
                              }}
                              autoFocus
                              className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white/85 outline-none"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-white/85 hover:text-white/95 truncate">
                              {session.title}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-[10px] text-white/25">
                                <Clock className="w-3 h-3" />
                                Created: {formatDate(session.created_at)}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-white/25">
                                <Clock className="w-3 h-3" />
                                Modified: {formatDate(session.last_modified)}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setRenaming(session.session_id)
                          setNewTitle(session.title)
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(session.session_id)
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/40 hover:text-red-400 transition-all"
                        title="Archive"
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
