"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Maximize2, Minimize2, Send, Loader2, Bot,
  Volume2, Mic, Square, Search
} from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  model?: string
  loading?: boolean
  timestamp?: string
}

interface RemoteChatProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  sessionId?: string
}

let _msgCtr = 0
const msgUid = () => `msg-${++_msgCtr}-${Date.now()}`

export default function RemoteChat({
  isOpen,
  onClose,
  onToggle,
  sessionId: externalSessionId,
}: RemoteChatProps) {
  const [expanded, setExpanded] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState("llama3.2")
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([])
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef(externalSessionId || `local-${Date.now()}`)
  const recognitionRef = useRef<any>(null)

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch available models
  useEffect(() => {
    fetch(`${API_BASE}/v1/models`)
      .then((r) => r.json())
      .then((data) => {
        if (data.models?.length) {
          setModels(data.models)
        }
      })
      .catch(() => {
        setModels([
          { id: "llama3.2", name: "llama3.2" },
          { id: "deepseek-r1", name: "deepseek-r1" },
        ])
      })
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }, [input])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    setLoading(true)

    const userMsg: ChatMessage = { id: msgUid(), role: "user", text }
    const loadingId = msgUid()
    const loadingMsg: ChatMessage = {
      id: loadingId,
      role: "assistant",
      text: "",
      loading: true,
      model,
    }

    setMessages((m) => [...m, userMsg, loadingMsg])

    try {
      const res = await fetch(`${API_BASE}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionIdRef.current,
          model,
        }),
      })
      const data = await res.json()
      const reply = data.reply || "Done."

      setMessages((m) =>
        m.map((msg) =>
          msg.id === loadingId
            ? { ...msg, text: reply, loading: false, model: data.model || model }
            : msg
        )
      )
    } catch {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === loadingId
            ? { ...msg, text: "Could not reach backend. Is Ollama running?", loading: false }
            : msg
        )
      )
    } finally {
      setLoading(false)
    }
  }, [input, loading, model])

  const playAudio = useCallback(async (text: string, msgId: string) => {
    try {
      setIsPlaying(msgId)
      const res = await fetch(`${API_BASE}/v1/speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "en" }),
      })
      if (!res.ok) throw new Error("TTS failed")
      const blob = await res.blob()
      const audio = new Audio(URL.createObjectURL(blob))
      audio.onended = () => setIsPlaying(null)
      audio.play().catch(() => setIsPlaying(null))
    } catch {
      setIsPlaying(null)
    }
  }, [])

  const startRecording = useCallback(() => {
    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (!SpeechRecognition) return

      const recognition = new SpeechRecognition()
      recognition.lang = "en-US"
      recognition.interimResults = false
      recognition.continuous = false

      recognition.onstart = () => setIsRecording(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput((prev) => prev + (prev ? " " : "") + transcript)
      }
      recognition.onerror = () => setIsRecording(false)
      recognition.onend = () => setIsRecording(false)

      recognition.start()
      recognitionRef.current = recognition
    } catch {
      // Speech recognition not available
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }, [])

  // ── MINIMIZED STATE ──────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.15] transition-all shadow-xl backdrop-blur-xl group"
      >
        <Bot className="w-4 h-4 text-white/40 group-hover:text-white/60" />
        <span className="text-sm text-white/35 group-hover:text-white/55">Chat ⌘K</span>
      </button>
    )
  }

  // ── EXPANDED STATE ──────────────────────────────────────────

  if (false) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="h-full w-full" />

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 z-50 flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: "rgba(10, 10, 10, 0.92)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 30px rgba(100,60,200,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/[0.08]">
                  <Bot className="w-3.5 h-3.5 text-white/60" />
                </div>
                <span className="text-sm text-white/50 font-medium">LocalAgent - Playing with 3D Grid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShow3DGrid((v) => !v)}
                  title="Toggle 3D Grid"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-purple-400 bg-purple-500/[0.15] transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-all"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages - Same as before */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 pb-10">
                  <Bot className="w-8 h-8 text-white/10" />
                  <p className="text-white/20 text-sm">Spin the grid while we talk...</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-white/[0.08] text-white/80 rounded-br-sm"
                        : "text-white/60 rounded-bl-sm"
                    }`}
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-2 text-white/25 py-0.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    )}
                  </div>
                  {msg.role === "assistant" && !msg.loading && (
                    <button
                      onClick={() => playAudio(msg.text, msg.id)}
                      disabled={isPlaying === msg.id}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all disabled:opacity-50 mt-0.5"
                    >
                      {isPlaying === msg.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder="Ask anything... (keep spinning)"
                  disabled={loading}
                  className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none resize-none px-4 pt-3 pb-1.5 leading-relaxed"
                  style={{ minHeight: "38px" }}
                />
                <div className="flex items-center justify-between px-3 pb-2 pt-0.5">
                  <div className="flex items-center gap-1">
                    {(models.length ? models.slice(0, 3) : [{ id: "llama3.2", name: "llama3.2" }]).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setModel(m.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] transition-all ${
                          model === m.id
                            ? "bg-white/[0.08] text-white/60"
                            : "text-white/20 hover:text-white/40"
                        }`}
                      >
                        {m.id.split(":")[0]}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={loading}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isRecording
                          ? "bg-red-500/20 text-red-400"
                          : "bg-white/[0.06] text-white/30 hover:text-white/50"
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-3 h-3 fill-current" />
                      ) : (
                        <Mic className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={send}
                      disabled={loading || !input.trim()}
                      className="w-7 h-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-white/70" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`fixed z-50 flex flex-col overflow-hidden ${
          expanded
            ? "inset-4 rounded-2xl"
            : "bottom-6 right-6 w-[420px] h-[600px] rounded-2xl"
        }`}
        style={{
          background: "rgba(10, 10, 10, 0.92)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 30px rgba(100,60,200,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/[0.08]">
              <Bot className="w-3.5 h-3.5 text-white/60" />
            </div>
            <span className="text-sm text-white/50 font-medium">LocalAgent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShow3DGrid((v) => !v)}
              title="Toggle 3D Grid"
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                show3DGrid
                  ? "text-purple-400 bg-purple-500/[0.15]"
                  : "text-white/25 hover:text-white/50 hover:bg-white/[0.06]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-all"
            >
              {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 pb-10">
              <Bot className="w-8 h-8 text-white/10" />
              <p className="text-white/20 text-sm">What can I help with?</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-white/[0.08] text-white/80 rounded-br-sm"
                    : "text-white/60 rounded-bl-sm"
                }`}
              >
                {msg.loading ? (
                  <div className="flex items-center gap-2 text-white/25 py-0.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                )}
              </div>
              {msg.role === "assistant" && !msg.loading && (
                <button
                  onClick={() => playAudio(msg.text, msg.id)}
                  disabled={isPlaying === msg.id}
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all disabled:opacity-50 mt-0.5"
                >
                  {isPlaying === msg.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 pb-3 pt-1">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Ask anything..."
              disabled={loading}
              className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none resize-none px-4 pt-3 pb-1.5 leading-relaxed"
              style={{ minHeight: "38px" }}
            />
            <div className="flex items-center justify-between px-3 pb-2 pt-0.5">
              {/* Model selector */}
              <div className="flex items-center gap-1">
                {(models.length ? models.slice(0, 3) : [{ id: "llama3.2", name: "llama3.2" }]).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] transition-all ${
                      model === m.id
                        ? "bg-white/[0.08] text-white/60"
                        : "text-white/20 hover:text-white/40"
                    }`}
                  >
                    {m.id.split(":")[0]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isRecording
                      ? "bg-red-500/20 text-red-400"
                      : "bg-white/[0.06] text-white/30 hover:text-white/50"
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-3 h-3 fill-current" />
                  ) : (
                    <Mic className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-7 h-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-white/70" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
