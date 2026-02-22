"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Copy, Plus, Trash2, Lock, AlertCircle } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Secret {
  id: string
  name: string
  type: "link" | "username" | "password" | "api_key" | "token"
  value: string
  created_at: string
  copy_count: number
  last_copied: string | null
  copy_history: Array<{ timestamp: string; by: string }>
}

interface SecretsManagerProps {
  sessionId?: string
  isOpen?: boolean
  onClose?: () => void
}

export default function SecretsManager({ sessionId, isOpen = true, onClose }: SecretsManagerProps) {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [newSecret, setNewSecret] = useState({
    name: "",
    type: "api_key" as const,
    value: "",
  })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadSecrets()
    }
  }, [isOpen, sessionId])

  const loadSecrets = async () => {
    try {
      if (!sessionId) return
      const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/secrets`)
      if (res.ok) {
        const data = await res.json()
        setSecrets(data.secrets || [])
      }
    } catch (err) {
      console.error("Error loading secrets:", err)
    }
  }

  const handleAddSecret = async () => {
    if (!newSecret.name || !newSecret.value) {
      setError("Name and value required")
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/secrets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSecret),
      })

      if (res.ok) {
        setNewSecret({ name: "", type: "api_key", value: "" })
        setShowForm(false)
        setError("")
        loadSecrets()
      }
    } catch (err) {
      setError("Failed to save secret")
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = async (secret: Secret) => {
    try {
      await navigator.clipboard.writeText(secret.value)
      // Log copy event to backend
      await fetch(`${API_BASE}/v1/sessions/${sessionId}/secrets/${secret.id}/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      })
      loadSecrets()
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  const handleDeleteSecret = async (secretId: string) => {
    if (!confirm("Delete this secret? This cannot be undone.")) return

    try {
      await fetch(`${API_BASE}/v1/sessions/${sessionId}/secrets/${secretId}`, {
        method: "DELETE",
      })
      loadSecrets()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-white/40" />
            <h2 className="text-lg font-semibold text-white/85">Secrets Manager</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/70 transition-all"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Secrets List */}
          {secrets.length > 0 ? (
            <div className="space-y-3">
              {secrets.map((secret) => (
                <div
                  key={secret.id}
                  className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white/85">{secret.name}</p>
                      <p className="text-xs text-white/25 mt-0.5 capitalize">{secret.type}</p>
                    </div>
                    <span className="text-[10px] bg-white/5 text-white/40 px-2 py-1 rounded">
                      Copied {secret.copy_count}x
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 font-mono text-xs">
                      {showValues[secret.id] ? (
                        <span className="text-white/60 break-all">{secret.value}</span>
                      ) : (
                        <span className="text-white/25">{"•".repeat(Math.min(secret.value.length, 20))}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowValues((prev) => ({ ...prev, [secret.id]: !prev[secret.id] }))}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
                      title={showValues[secret.id] ? "Hide" : "Show"}
                    >
                      {showValues[secret.id] ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopySecret(secret)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSecret(secret.id)}
                      className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400/40 hover:text-red-400 transition-all"
                      title="Delete secret"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {secret.last_copied && (
                    <p className="text-[10px] text-white/20">
                      Last copied: {new Date(secret.last_copied).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/25 py-8">No secrets yet</p>
          )}

          {/* Add Secret Form */}
          {showForm && (
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Secret Name</label>
                <input
                  type="text"
                  placeholder="e.g., OpenAI API Key"
                  value={newSecret.name}
                  onChange={(e) => setNewSecret((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 outline-none focus:border-white/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Type</label>
                <select
                  value={newSecret.type}
                  onChange={(e) => setNewSecret((p) => ({ ...p, type: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/85 outline-none focus:border-white/20 text-sm"
                >
                  <option value="api_key">API Key</option>
                  <option value="password">Password</option>
                  <option value="token">Token</option>
                  <option value="username">Username</option>
                  <option value="link">Link</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Value</label>
                <textarea
                  placeholder="Enter secret value..."
                  value={newSecret.value}
                  onChange={(e) => setNewSecret((p) => ({ ...p, value: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 outline-none focus:border-white/20 text-sm resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddSecret}
                  disabled={loading}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 text-blue-400 text-sm font-medium transition-all"
                >
                  {loading ? "Saving..." : "Save Secret"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/85 text-xs font-medium transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Secret
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
