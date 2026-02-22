"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle, Zap, AlertCircle } from "lucide-react"

interface ThinkingAction {
  id: string
  type: "thinking" | "action" | "executing" | "complete" | "error"
  text: string
  timestamp: string
  duration?: number
}

interface ThinkingDisplayProps {
  isActive: boolean
  actions?: ThinkingAction[]
  currentText?: string
}

export default function ThinkingDisplay({ isActive, actions = [], currentText }: ThinkingDisplayProps) {
  const [displayedActions, setDisplayedActions] = useState<ThinkingAction[]>([])
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    setDisplayedActions(actions)
  }, [actions])

  if (!isActive && displayedActions.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "thinking":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case "executing":
        return <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
      case "action":
        return <Zap className="w-4 h-4 text-yellow-400" />
      case "complete":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case "thinking":
        return "Thinking…"
      case "executing":
        return "Executing…"
      case "action":
        return "Action"
      case "complete":
        return "Complete"
      case "error":
        return "Error"
      default:
        return type
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-md">
      {/* Collapsed view */}
      {!expanded && isActive && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all"
        >
          <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span className="text-xs text-white/60">Working…</span>
        </button>
      )}

      {/* Expanded view */}
      {expanded && (
        <div className="rounded-lg bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span className="text-xs font-medium text-white/85">Thinking & Execution</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-white/25 hover:text-white/60 transition-all"
            >
              −
            </button>
          </div>

          {/* Current thinking text */}
          {currentText && (
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs text-white/60 italic leading-relaxed">{currentText}</p>
            </div>
          )}

          {/* Actions list */}
          <div className="max-h-64 overflow-y-auto scrollbar-none">
            {displayedActions.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-white/25">No actions yet…</p>
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {displayedActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]"
                  >
                    <div className="shrink-0 mt-0.5">{getIcon(action.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-white/70">{getLabel(action.type)}</p>
                      <p className="text-[10px] text-white/40 mt-1 line-clamp-2 leading-relaxed">{action.text}</p>
                      {action.duration && (
                        <p className="text-[9px] text-white/20 mt-1">{action.duration}ms</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status indicator */}
          {isActive && (
            <div className="px-4 py-2 bg-blue-500/10 border-t border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] text-blue-400">Processing…</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
