"use client"

import { useState, useEffect } from "react"
import {
  ChevronRight, ChevronDown, Plus, FolderPlus, MoreVertical, Trash2, Edit2, FolderOpen
} from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Session {
  session_id: string
  folder_id: string
  title: string
  created_at: string
  last_modified: string
}

interface Folder {
  id: string
  name: string
  sessions: string[]
}

interface SessionSidebarProps {
  currentSession: string | null
  onSessionChange: (sessionId: string, metadata: Session) => void
  onNewSession: () => void
  onNewFolder: () => void
}

export default function SessionSidebar({
  currentSession,
  onSessionChange,
  onNewSession,
  onNewFolder,
}: SessionSidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [sessions, setSessions] = useState<Record<string, Session[]>>({})
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["default"]))
  const [loading, setLoading] = useState(true)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  // Load folders and sessions on mount
  useEffect(() => {
    loadFoldersAndSessions()
  }, [])

  const loadFoldersAndSessions = async () => {
    try {
      setLoading(true)
      // Load folders
      const foldersRes = await fetch(`${API_BASE}/v1/folders`)
      const foldersData = await foldersRes.json()
      setFolders(foldersData)

      // Load all sessions
      const sessionsRes = await fetch(`${API_BASE}/v1/sessions`)
      const allSessions = await sessionsRes.json()

      // Organize by folder
      const byFolder: Record<string, Session[]> = {}
      foldersData.forEach((folder: Folder) => {
        byFolder[folder.id] = []
      })

      allSessions.forEach((session: Session) => {
        if (!byFolder[session.folder_id]) {
          byFolder[session.folder_id] = []
        }
        byFolder[session.folder_id].push(session)
      })

      setSessions(byFolder)
    } catch (err) {
      console.error("Error loading folders/sessions:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFolderExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateSession = async (folderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/sessions?folder_id=${folderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const newSession = await res.json()
      onSessionChange(newSession.session_id, newSession)
      loadFoldersAndSessions()
    } catch (err) {
      console.error("Error creating session:", err)
    }
  }

  const handleRenameSession = async (sessionId: string) => {
    try {
      await fetch(`${API_BASE}/v1/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newName }),
      })
      loadFoldersAndSessions()
      setRenaming(null)
    } catch (err) {
      console.error("Error renaming session:", err)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Archive this session? This cannot be undone.")) return

    try {
      await fetch(`${API_BASE}/v1/sessions/${sessionId}`, {
        method: "DELETE",
      })
      loadFoldersAndSessions()
    } catch (err) {
      console.error("Error deleting session:", err)
    }
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="w-64 bg-[#0a0a0a] border-r border-white/5 flex items-center justify-center">
        <p className="text-white/30 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Sessions</h2>
        <div className="flex gap-2">
          <button
            onClick={onNewSession}
            title="New session in default folder"
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Session
          </button>
          <button
            onClick={onNewFolder}
            title="New folder"
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Folder
          </button>
        </div>
      </div>

      {/* Folders & Sessions */}
      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {folders.map((folder) => (
          <div key={folder.id}>
            {/* Folder Header */}
            <button
              onClick={() => toggleFolderExpand(folder.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm text-white/70 hover:text-white/85"
            >
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="w-4 h-4 text-white/40" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/40" />
              )}
              <FolderOpen className="w-4 h-4 text-white/40" />
              <span className="flex-1 text-left">{folder.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCreateSession(folder.id)
                }}
                className="opacity-0 hover:opacity-100 p-1 rounded hover:bg-white/10"
                title="New session in this folder"
              >
                <Plus className="w-3 h-3 text-white/40" />
              </button>
            </button>

            {/* Sessions in folder */}
            {expandedFolders.has(folder.id) && (
              <div className="space-y-1 ml-2">
                {(sessions[folder.id] || []).map((session) => (
                  <div
                    key={session.session_id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      currentSession === session.session_id
                        ? "bg-white/10 text-white/85 border border-white/15"
                        : "hover:bg-white/5 text-white/60 hover:text-white/75"
                    }`}
                    onClick={() => onSessionChange(session.session_id, session)}
                  >
                    {renaming === session.session_id ? (
                      <div className="flex-1 flex gap-1">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameSession(session.session_id)
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
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{session.title}</p>
                          <p className="text-[10px] text-white/30">{formatDate(session.last_modified)}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setRenaming(session.session_id)
                              setNewName(session.title)
                            }}
                            className="p-1 rounded hover:bg-white/10"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3 text-white/40" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSession(session.session_id)
                            }}
                            className="p-1 rounded hover:bg-white/10"
                            title="Archive"
                          >
                            <Trash2 className="w-3 h-3 text-white/40" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {(!sessions[folder.id] || sessions[folder.id].length === 0) && (
                  <p className="text-xs text-white/20 px-3 py-2">No sessions</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
