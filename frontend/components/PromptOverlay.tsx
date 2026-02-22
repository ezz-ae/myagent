"use client"

import { X, AlertCircle, Clock, Brain, Zap } from "lucide-react"

interface Prompt {
  id: string
  type: string
  name: string
  content: string
  state: string
  created_at: string
  metadata: Record<string, any>
}

interface PromptOverlayProps {
  prompt: Prompt
  onClose: () => void
}

export default function PromptOverlay({ prompt, onClose }: PromptOverlayProps) {
  const getPromptIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      task: <AlertCircle className="w-4 h-4" />,
      learn: <Brain className="w-4 h-4" />,
      roles: <Zap className="w-4 h-4" />,
      time_target: <Clock className="w-4 h-4" />,
      schedule: <Clock className="w-4 h-4" />,
      debate: <AlertCircle className="w-4 h-4" />,
      interview: <Brain className="w-4 h-4" />,
      forbidden_words: <AlertCircle className="w-4 h-4" />,
      read: <Brain className="w-4 h-4" />,
    }
    return icons[type] || <AlertCircle className="w-4 h-4" />
  }

  const getPromptColor = (type: string) => {
    const colors: Record<string, string> = {
      task: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
      learn: "from-purple-500/10 to-purple-600/5 border-purple-500/20",
      roles: "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20",
      time_target: "from-orange-500/10 to-orange-600/5 border-orange-500/20",
      schedule: "from-green-500/10 to-green-600/5 border-green-500/20",
      debate: "from-red-500/10 to-red-600/5 border-red-500/20",
      interview: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20",
      forbidden_words: "from-pink-500/10 to-pink-600/5 border-pink-500/20",
      read: "from-teal-500/10 to-teal-600/5 border-teal-500/20",
    }
    return colors[type] || "from-white/5 to-white/2 border-white/10"
  }

  const getPromptTextColor = (type: string) => {
    const colors: Record<string, string> = {
      task: "text-blue-400",
      learn: "text-purple-400",
      roles: "text-cyan-400",
      time_target: "text-orange-400",
      schedule: "text-green-400",
      debate: "text-red-400",
      interview: "text-indigo-400",
      forbidden_words: "text-pink-400",
      read: "text-teal-400",
    }
    return colors[type] || "text-white/60"
  }

  const formatPromptType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div
      className={`mx-4 mt-4 mb-3 px-4 py-3 rounded-lg border bg-gradient-to-r ${getPromptColor(
        prompt.type
      )} transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className={`shrink-0 mt-0.5 ${getPromptTextColor(prompt.type)}`}>
            {getPromptIcon(prompt.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${getPromptTextColor(prompt.type)}`}>
                {formatPromptType(prompt.type)}
              </span>
              <span className="text-xs text-white/50">Active Prompt</span>
            </div>
            <h3 className="text-sm font-medium text-white/85 mt-0.5">{prompt.name}</h3>
            <p className="text-xs text-white/50 mt-1 line-clamp-2">{prompt.content}</p>

            {/* Metadata based on type */}
            {prompt.type === "time_target" && prompt.metadata?.deadline && (
              <p className="text-xs text-orange-300 mt-2">
                ⏱️ Deadline: {prompt.metadata.deadline}
              </p>
            )}

            {prompt.type === "forbidden_words" && prompt.metadata?.words && (
              <p className="text-xs text-pink-300 mt-2">
                🚫 Forbidden: {prompt.metadata.words.join(", ")}
              </p>
            )}

            {prompt.type === "schedule" && prompt.metadata?.date && (
              <p className="text-xs text-green-300 mt-2">
                📅 Scheduled: {prompt.metadata.date}
              </p>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
          title="Deactivate prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
