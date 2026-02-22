"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Edit2, Eye, EyeOff, Copy, Globe, Mail, ShoppingBag, Zap } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Link {
  id: string
  title: string
  description: string
  href: string
  icon: string
  color: string
  secret_id?: string  // Reference to secret in SecretsManager
  requires_auth?: boolean
}

interface LinkBioManagerProps {
  sessionId: string
  isOpen: boolean
  onClose: () => void
  onToggle?: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="w-5 h-5" />,
  Mail: <Mail className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
}

export default function LinkBioManager({ sessionId, isOpen, onClose }: LinkBioManagerProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    href: "",
    icon: "Globe",
    color: "blue",
    requires_auth: false,
  })

  useEffect(() => {
    if (isOpen) loadLinks()
  }, [isOpen, sessionId])

  const loadLinks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/links`)
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links || [])
      }
    } catch (err) {
      console.error("Error loading links:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = async () => {
    if (!formData.title || !formData.href) return

    try {
      const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({
          title: "",
          description: "",
          href: "",
          icon: "Globe",
          color: "blue",
          requires_auth: false,
        })
        setShowForm(false)
        loadLinks()
      }
    } catch (err) {
      console.error("Error adding link:", err)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      await fetch(`${API_BASE}/v1/sessions/${sessionId}/links/${linkId}`, {
        method: "DELETE",
      })
      loadLinks()
    } catch (err) {
      console.error("Error deleting link:", err)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-40 max-w-sm w-full"
      >
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white/85">Model Links</h3>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/70 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="max-h-64 overflow-y-auto scrollbar-none p-3 space-y-2">
            {loading ? (
              <p className="text-xs text-white/25 text-center py-4">Loading…</p>
            ) : links.length === 0 ? (
              <p className="text-xs text-white/25 text-center py-4">No links yet</p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white/85">{link.title}</span>
                      {link.requires_auth && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                          Auth
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-0.5 rounded hover:bg-red-500/10 text-red-400/40 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 truncate">{link.href}</p>
                  <p className="text-[10px] text-white/30 mt-1">{link.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Link Form */}
          {showForm && (
            <div className="p-3 border-t border-white/5 space-y-2">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 outline-none focus:border-white/20"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 outline-none focus:border-white/20"
              />
              <input
                type="url"
                placeholder="URL"
                value={formData.href}
                onChange={(e) => setFormData((p) => ({ ...p, href: e.target.value }))}
                className="w-full px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 outline-none focus:border-white/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddLink}
                  className="flex-1 px-2 py-1 rounded text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-2 py-1 rounded text-xs bg-white/5 hover:bg-white/10 text-white/60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-3 py-2 border-t border-white/5 flex gap-2">
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/85 transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Link
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
