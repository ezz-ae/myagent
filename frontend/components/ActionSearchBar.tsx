"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, MessageSquare, LayoutDashboard, Settings, Activity,
  Mic, FileText, Link2, Lock, Monitor, Zap, Keyboard,
  BarChart3, Brain, Gamepad2, X
} from "lucide-react"

export interface Action {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  shortcut?: string
  action: () => void
  category: string
}

interface ActionSearchBarProps {
  actions?: Action[]
  onNavigate?: (route: string) => void
  onToggleChat?: () => void
  placeholder?: string
}

const defaultActions: Action[] = []

export default function ActionSearchBar({
  actions: customActions,
  onNavigate,
  onToggleChat,
  placeholder = "Search actions... ⌘K",
}: ActionSearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const builtInActions: Action[] = [
    {
      id: "chat",
      label: "Toggle Chat",
      icon: <MessageSquare className="w-4 h-4" />,
      description: "Open or minimize the chat panel",
      shortcut: "⌘K",
      action: () => onToggleChat?.(),
      category: "Navigation",
    },
    {
      id: "overview",
      label: "Overview Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      description: "View system overview and stats",
      action: () => onNavigate?.("overview"),
      category: "Dashboards",
    },
    {
      id: "monitoring",
      label: "Monitoring",
      icon: <Monitor className="w-4 h-4" />,
      description: "Real-time price & event tracking",
      action: () => onNavigate?.("monitoring"),
      category: "Dashboards",
    },
    {
      id: "sessions",
      label: "Sessions",
      icon: <FileText className="w-4 h-4" />,
      description: "Manage conversation sessions",
      action: () => onNavigate?.("sessions"),
      category: "Dashboards",
    },
    {
      id: "prompts",
      label: "Prompts",
      icon: <Brain className="w-4 h-4" />,
      description: "Manage active prompts (9 types)",
      action: () => onNavigate?.("prompts"),
      category: "Dashboards",
    },
    {
      id: "activity",
      label: "Activity Log",
      icon: <Activity className="w-4 h-4" />,
      description: "View smart activity log",
      action: () => onNavigate?.("activity"),
      category: "Dashboards",
    },
    {
      id: "recordings",
      label: "Recordings",
      icon: <Mic className="w-4 h-4" />,
      description: "Browse voice recordings",
      action: () => onNavigate?.("recordings"),
      category: "Dashboards",
    },
    {
      id: "secrets",
      label: "Secrets Manager",
      icon: <Lock className="w-4 h-4" />,
      description: "Manage API keys & passwords",
      action: () => onNavigate?.("secrets"),
      category: "Tools",
    },
    {
      id: "links",
      label: "Link Bio",
      icon: <Link2 className="w-4 h-4" />,
      description: "Manage your link collection",
      action: () => onNavigate?.("links"),
      category: "Tools",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      description: "Configure LocalAgent",
      action: () => onNavigate?.("settings"),
      category: "System",
    },
    {
      id: "typing-game",
      label: "Speed Typing Test",
      icon: <Keyboard className="w-4 h-4" />,
      description: "Test your typing speed",
      action: () => onNavigate?.("typing-game"),
      category: "Fun",
    },
  ]

  const allActions = [...builtInActions, ...(customActions || [])]

  const filteredActions = query.trim()
    ? allActions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.description?.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : allActions

  // Group by category
  const grouped = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = []
    acc[action.category].push(action)
    return acc
  }, {} as Record<string, Action[]>)

  const flatActions = filteredActions

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((v) => !v)
        if (!isOpen) {
          setTimeout(() => inputRef.current?.focus(), 50)
        }
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
        setQuery("")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Arrow key navigation
  useEffect(() => {
    if (!isOpen) return
    const handleNav = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, flatActions.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter" && flatActions[selectedIndex]) {
        e.preventDefault()
        flatActions[selectedIndex].action()
        setIsOpen(false)
        setQuery("")
      }
    }
    window.addEventListener("keydown", handleNav)
    return () => window.removeEventListener("keydown", handleNav)
  }, [isOpen, selectedIndex, flatActions])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = useCallback((action: Action) => {
    action.action()
    setIsOpen(false)
    setQuery("")
  }, [])

  return (
    <>
      {/* Search trigger bar */}
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className="w-full max-w-xl mx-auto flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all group cursor-text"
      >
        <Search className="w-4 h-4 text-white/25 group-hover:text-white/40 transition-colors" />
        <span className="text-sm text-white/25 group-hover:text-white/40 transition-colors flex-1 text-left">
          {placeholder}
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/30">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4"
            onClick={() => { setIsOpen(false); setQuery("") }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Search panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#111111] shadow-2xl overflow-hidden"
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                <Search className="w-4 h-4 text-white/30 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search actions..."
                  className="flex-1 bg-transparent text-sm text-white/85 placeholder:text-white/25 outline-none"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-white/30 hover:text-white/50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/25">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2 scrollbar-none">
                {Object.entries(grouped).map(([category, actions]) => (
                  <div key={category}>
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-[10px] uppercase tracking-widest text-white/20 font-medium">
                        {category}
                      </span>
                    </div>
                    {actions.map((action) => {
                      const idx = flatActions.indexOf(action)
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleSelect(action)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            idx === selectedIndex
                              ? "bg-white/[0.06] text-white/85"
                              : "text-white/50 hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className={idx === selectedIndex ? "text-white/60" : "text-white/25"}>
                            {action.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{action.label}</span>
                            {action.description && (
                              <p className="text-xs text-white/30 truncate mt-0.5">
                                {action.description}
                              </p>
                            )}
                          </div>
                          {action.shortcut && (
                            <kbd className="text-[10px] text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                              {action.shortcut}
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}

                {flatActions.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-white/25">No actions found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
