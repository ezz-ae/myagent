"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Eye, Upload, LayoutDashboard, Link as LinkIcon } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Dashboard {
  id: string
  name: string
  description: string
  source: "url" | "file" | "builtin"
  url?: string
  thumbnail?: string
  created_at: string
  attachable: boolean
}

interface StandaloneDashboardsProps {
  sessionId?: string
  onSelect?: (dashboard: Dashboard) => void
  isOpen?: boolean
  onClose?: () => void
}

export default function StandaloneDashboards({
  sessionId,
  onSelect,
  isOpen = true,
  onClose,
}: StandaloneDashboardsProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadUrl, setUploadUrl] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadDashboards()
    }
  }, [isOpen, sessionId])

  const loadDashboards = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/v1/dashboards`)
      if (res.ok) {
        const data = await res.json()
        setDashboards(data.dashboards || [])
      }
    } catch (err) {
      console.error("Error loading dashboards:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDashboard = async () => {
    if (!uploadUrl.trim()) return

    try {
      const res = await fetch(`${API_BASE}/v1/dashboards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadUrl.split("/").pop() || "Dashboard",
          source: "url",
          url: uploadUrl,
          description: "External dashboard",
        }),
      })

      if (res.ok) {
        setUploadUrl("")
        setShowUpload(false)
        loadDashboards()
      }
    } catch (err) {
      console.error("Error adding dashboard:", err)
    }
  }

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (!confirm("Delete this dashboard? This cannot be undone.")) return

    try {
      await fetch(`${API_BASE}/v1/dashboards/${dashboardId}`, {
        method: "DELETE",
      })
      loadDashboards()
    } catch (err) {
      console.error("Error deleting dashboard:", err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-white/40" />
            <h2 className="text-lg font-semibold text-white/85">Standalone Dashboards</h2>
            <span className="ml-2 text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
              {dashboards.length} dashboards
            </span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-all">
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-white/25">Loading dashboards…</div>
          ) : dashboards.length === 0 ? (
            <div className="text-center py-12">
              <LayoutDashboard className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm">No dashboards yet</p>
              <p className="text-white/15 text-xs mt-1">Add your first dashboard to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="group p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all"
                >
                  {/* Thumbnail */}
                  {dashboard.thumbnail && (
                    <div className="w-full h-32 rounded-lg bg-white/5 border border-white/5 overflow-hidden mb-3">
                      <img
                        src={dashboard.thumbnail}
                        alt={dashboard.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <h3 className="font-medium text-white/85 mb-1">{dashboard.name}</h3>
                  <p className="text-xs text-white/40 mb-3 line-clamp-2">{dashboard.description}</p>

                  {/* Source badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/40 capitalize">
                      {dashboard.source === "url" ? (
                        <>
                          <LinkIcon className="w-2.5 h-2.5 inline mr-1" />
                          External
                        </>
                      ) : (
                        "Local"
                      )}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelect?.(dashboard)}
                      disabled={!dashboard.attachable}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-blue-400 text-xs font-medium transition-all"
                      title={dashboard.attachable ? "Attach to canvas" : "Not attachable"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {dashboard.attachable ? "Attach" : "View"}
                    </button>
                    <button
                      onClick={() => handleDeleteDashboard(dashboard.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 text-xs transition-all"
                      title="Delete dashboard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload form */}
          {showUpload && (
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Dashboard URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/dashboard"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 outline-none focus:border-white/20 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddDashboard}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium transition-all"
                >
                  Add Dashboard
                </button>
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          {!showUpload && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/85 text-xs font-medium transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
