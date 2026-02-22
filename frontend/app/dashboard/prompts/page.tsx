"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Zap, ChevronLeft, Trash2, CheckCircle } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Prompt {
  id: string
  type: string
  name: string
  content: string
  state: string
  created_at: string
  metadata: Record<string, any>
}

const PROMPT_COLORS: Record<string, string> = {
  task: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  learn: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  roles: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  time_target: "bg-orange-500/15 text-orange-300 border-orange-500/20",
  schedule: "bg-green-500/15 text-green-300 border-green-500/20",
  debate: "bg-red-500/15 text-red-300 border-red-500/20",
  interview: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  forbidden_words: "bg-pink-500/15 text-pink-300 border-pink-500/20",
  read: "bg-teal-500/15 text-teal-300 border-teal-500/20",
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      setLoading(true)
      // Load from first available session - would need to aggregate from all
      const sessionsRes = await fetch(`${API_BASE}/v1/sessions`)
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json()
        if (sessions.length > 0) {
          const promptsRes = await fetch(`${API_BASE}/v1/sessions/${sessions[0].session_id}/prompts`)
          if (promptsRes.ok) {
            const data = await promptsRes.json()
            setPrompts(data.active_prompts || [])
          }
        }
      }
    } catch (err) {
      console.error("Error loading prompts:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (promptId: string) => {
    if (!confirm("Deactivate this prompt?")) return

    try {
      const sessionsRes = await fetch(`${API_BASE}/v1/sessions`)
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json()
        if (sessions.length > 0) {
          await fetch(`${API_BASE}/v1/sessions/${sessions[0].session_id}/prompts/${promptId}`, {
            method: "DELETE",
          })
          loadPrompts()
        }
      }
    } catch (err) {
      console.error("Error deleting prompt:", err)
    }
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
              <h1 className="text-2xl font-semibold text-white/90">Prompts</h1>
              <p className="text-xs text-white/30 mt-0.5">{prompts.length} active prompts</p>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        <div>
          {loading ? (
            <div className="text-center py-12 text-white/25">Loading prompts…</div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm">No active prompts</p>
              <Link
                href="/"
                className="text-blue-400/60 hover:text-blue-400 text-xs mt-2 inline-block"
              >
                Create one in Chat →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className={`p-5 rounded-xl border ${PROMPT_COLORS[prompt.type] || "bg-white/5 text-white/50 border-white/10"} transition-all group hover:border-opacity-100`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">{prompt.name}</p>
                        <p className="text-[10px] opacity-60 capitalize">{prompt.type}</p>
                      </div>
                    </div>
                    {prompt.state === "active" && (
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-xs opacity-70 mb-3 line-clamp-3">{prompt.content}</p>

                  {/* Metadata */}
                  {prompt.metadata && (
                    <div className="space-y-1 mb-3 text-[10px] opacity-60">
                      {prompt.metadata.deadline && (
                        <p>⏱️ Deadline: {prompt.metadata.deadline}</p>
                      )}
                      {prompt.metadata.words && (
                        <p>🚫 Forbidden: {prompt.metadata.words.join(", ").slice(0, 30)}…</p>
                      )}
                      {prompt.metadata.schedule_time && (
                        <p>📅 Schedule: {prompt.metadata.schedule_time}</p>
                      )}
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-all bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400"
                  >
                    Deactivate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
