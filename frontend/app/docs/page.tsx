"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Mic, Cpu, Link2, BarChart3, Phone, Archive, Key, Search,
  Terminal, MessageSquare, ChevronDown, ChevronRight,
  Shield, Lock, Zap, Server, FileText,
} from "lucide-react"

const sections = [
  {
    id: "overview",
    title: "System Overview",
    icon: Terminal,
    color: "#A06CD5",
    content: `LocalAgent is an AI Complete Local Monetisation System. It runs 100% on your machine using Ollama as the local model runtime. No data is transmitted to external servers. No subscription is required after purchase.

The system includes a FastAPI backend, a Next.js frontend, and a suite of monetizable tools. All data is stored locally in JSON files and JSONL streams.

The AI always presents itself as "LocalAgent" regardless of which underlying model powers it. Vendor identity is completely suppressed at the system prompt level.`,
  },
  {
    id: "identity",
    title: "Model Identity System",
    icon: Shield,
    color: "#10B981",
    content: `The system prompt in backend/main.py contains an immutable IDENTITY block at the top of every request. This block instructs the AI to:

• Never identify as DeepSeek, OpenAI, Meta, Anthropic, Llama, Gemini, or any other vendor
• Always respond to "who are you?" with: "I am LocalAgent, your private local AI system."
• Always respond to "what model are you?" with: "I am LocalAgent — a private, locally-running AI system. Model details are private."
• Treat the LocalAgent identity as absolute and non-negotiable

This works regardless of which Ollama model is loaded. The system prompt override is enforced on every single API call.`,
  },
  {
    id: "architecture",
    title: "Architecture",
    icon: Server,
    color: "#4F46E5",
    content: `Backend: FastAPI (Python) running on port 8000
Frontend: Next.js 15 running on port 3000
Storage: JSON/JSONL files in backend/data/
AI Runtime: Ollama (local, any compatible model)
TTS: ElevenLabs (optional, API key required)
Voice Calls: Twilio (optional, credentials required)

Data persistence structure:
  backend/data/
  ├── sessions/{session_id}/
  │   ├── metadata.json
  │   ├── messages.jsonl
  │   ├── prompts.json
  │   ├── secrets.json
  │   ├── links.json
  │   └── recordings/
  ├── memory.jsonl
  ├── dashboard.json
  └── folders.json`,
  },
  {
    id: "tools",
    title: "Tools Reference",
    icon: Zap,
    color: "#F59E0B",
    content: `All tools are accessible through the main application interface at /app.

Core Tools:
• Chat — Direct AI conversation with full session history
• Voice Generator — Text-to-speech via ElevenLabs
• Prompt Manager — Build and store custom AI prompts
• Session Archive — Organize conversations into folders
• Cross-Session Memory — Persistent facts across all sessions
• Secrets Manager — Encrypted local credential storage
• Link Bio Manager — Manage link collections with metadata
• Dashboard Builder — Custom intelligence panels
• Device Search — Full-machine file search
• AI Calling — Twilio outbound voice campaigns (optional)

Each tool is documented in the Money Guides at /blog with full usage instructions and monetization strategies.`,
  },
  {
    id: "prompts",
    title: "Prompt System",
    icon: Cpu,
    color: "#EC4899",
    content: `The Prompt Manager supports 9 prompt types:

TASK — Specific instruction sets for the AI
FORBIDDEN_WORDS — Words the AI must never use in responses
SCHEDULE — Time-based instruction contexts
LEARN — Knowledge injection prompts
ROLES — Persona and role assignments
READ — Document reading contexts
TIME_TARGET — Time-constrained task prompts
DEBATE — Multi-perspective analysis prompts
INTERVIEW — Structured Q&A prompts

To add a prompt: Navigate to /app → Prompts → Add Prompt
Prompts are activated per-session and injected into every message context.
Templates are available in /v1/prompts/templates.`,
  },
  {
    id: "memory",
    title: "Cross-Session Memory",
    icon: Archive,
    color: "#0891B2",
    content: `Cross-session memory persists facts across all conversations. This is different from session history (which is per-session only).

Memory is stored in backend/data/memory.jsonl.

API endpoints:
  GET  /v1/memory          — Retrieve all memory entries
  POST /v1/memory          — Add a new memory entry (body: {content, category})
  DELETE /v1/memory/{id}   — Remove a specific entry

Memory is automatically injected into every chat request. The AI uses it to maintain context about you, your preferences, and your recurring tasks.

Use memory for: user preferences, client details, recurring task parameters, business context.`,
  },
  {
    id: "secrets",
    title: "Secrets Manager",
    icon: Key,
    color: "#6366F1",
    content: `The Secrets Manager stores credentials locally with full audit logging.

Supported secret types:
• API keys
• Passwords
• URLs and endpoints
• Authentication tokens
• Configuration strings

All secrets are stored in backend/data/sessions/{id}/secrets.json.
Copy events are logged with timestamps.
No secrets are ever transmitted externally.

API endpoints:
  GET  /v1/sessions/{id}/secrets          — List all secrets
  POST /v1/sessions/{id}/secrets          — Add secret (body: {label, value, category})
  DELETE /v1/sessions/{id}/secrets/{sid}  — Delete secret
  POST /v1/sessions/{id}/secrets/{sid}/copy — Log copy event`,
  },
  {
    id: "voice",
    title: "Voice & Audio",
    icon: Mic,
    color: "#A06CD5",
    content: `Voice generation requires an ElevenLabs API key stored in your .env file:
  ELEVENLABS_API_KEY=your_key_here

Supported languages: English (default), Arabic, and all ElevenLabs-supported languages.
Voice selection is automatic based on language.
Audio is saved as MP3 in the session recordings folder.

API endpoints:
  POST /v1/speech        — Generate audio (body: {text, language, session_id})
  GET  /v1/languages     — List available language codes
  GET  /v1/sessions/{id}/recordings     — List recordings
  GET  /v1/sessions/{id}/recordings/{r} — Download recording

For voice calling (Twilio), configure credentials in .env:
  TWILIO_ACCOUNT_SID=...
  TWILIO_AUTH_TOKEN=...
  TWILIO_PHONE_NUMBER=...`,
  },
  {
    id: "setup",
    title: "Setup & Configuration",
    icon: FileText,
    color: "#EF4444",
    content: `Quick Start (automatic via install.sh):
  1. Run: bash install.sh
  2. Configure .env with your API keys and runtime
  3. Start backend: cd backend && bash run.sh
  4. Start frontend: cd frontend && npm run dev
  5. Open http://localhost:3000

Manual setup:
  Backend:
    pip install -r backend/requirements.txt
    cd backend && uvicorn main:app --reload --port 8000

  Frontend:
    cd frontend && npm install && npm run dev

Runtime hints:
  • Run Ollama/InvokeAI locally: e.g. `ollama serve --model /full/path/llava-v1.5-7b-q4.llamafile --port 11434`
  • Point LocalAgent at that runtime via `AI_RUNTIME_BASE_URL=http://localhost:11434/v1`
  • Override API key if needed: `MODEL_API_KEY=your-token`
  • Set `DEFAULT_MODEL=llava-v1.5-7b-q4` and `ALLOWED_MODELS=llava-v1.5-7b-q4,llama3.2,deepseek-r1` for fallback

Required .env variables:
  AI_RUNTIME_BASE_URL=http://localhost:11434/v1   (defaults to Ollama)
  MODEL_API_KEY=ollama                            (use a token if your runtime requires auth)
  DEFAULT_MODEL=llava-v1.5-7b-q4                  (pick your preferred model)
  ALLOWED_MODELS=llava-v1.5-7b-q4,llama3.2,deepseek-r1
  ELEVENLABS_API_KEY=...   (optional, for voice)
  TWILIO_ACCOUNT_SID=...   (optional, for calling)
  TWILIO_AUTH_TOKEN=...    (optional, for calling)
  TWILIO_PHONE_NUMBER=...  (optional, for calling)

Supported models: any identifier returned by your runtime (llava-v1.5-7b-q4, llama3.2, deepseek-r1, etc.). Change model via the selector in the app UI.`,
  },
]

const systemStats = [
  { label: "Runtime", value: "Ollama local LLM" },
  { label: "Backend", value: "FastAPI on :8000" },
  { label: "Frontend", value: "Next.js on :3002" },
  { label: "Storage", value: "JSON + JSONL" },
  { label: "Identity", value: "LocalAgent enforced" },
]

const endpointHighlights = [
  { label: "Chat", value: "POST /v1/chat" },
  { label: "Sessions", value: "GET /v1/sessions" },
  { label: "Memory", value: "GET /v1/memory" },
  { label: "Speech", value: "POST /v1/speech" },
]

function Section({ section }: { section: (typeof sections)[0] }) {
  const [open, setOpen] = useState(false)
  const Icon = section.icon

  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${section.color}15`, border: `1px solid ${section.color}25` }}
          >
            <Icon className="w-4 h-4" style={{ color: section.color }} />
          </div>
          <span className="text-white/80 font-medium text-sm">{section.title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="border-t border-white/[0.05] px-6 pb-6 pt-5"
        >
          <pre className="text-white/50 text-sm leading-[1.85] whitespace-pre-wrap font-mono">
            {section.content}
          </pre>
        </motion.div>
      )}
    </div>
  )
}

export default function DocsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-white/40 text-xs font-mono tracking-[0.25em] uppercase hover:text-white/70 transition-colors"
          >
            ← LocalAgent
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/blog")} className="text-white/40 text-sm hover:text-white/60 transition-colors">Money Guides</button>
            <button onClick={() => router.push("/app")} className="text-xs font-medium px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 transition-colors">
              Launch App
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.5fr,0.7fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <p className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase mb-4">
                Documentation
              </p>
              <h1 className="text-4xl font-bold mb-4">System Reference</h1>
              <p className="text-white/40 text-base leading-relaxed max-w-2xl">
                Complete technical documentation for LocalAgent. Click any section to expand.
              </p>
            </motion.div>

            <div className="space-y-3">
              {sections.map((section, i) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <Section section={section} />
                </motion.div>
              ))}
            </div>

            {/* Links */}
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/blog")}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <div>
                  <p className="text-white/70 font-medium text-sm mb-0.5">Money Guides</p>
                  <p className="text-white/35 text-xs">How to earn from each tool</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
              </button>
              <button
                onClick={() => router.push("/monetization")}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <div>
                  <p className="text-white/70 font-medium text-sm mb-0.5">Monetization</p>
                  <p className="text-white/35 text-xs">Turn workflows into revenue</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-4">System Snapshot</p>
              <div className="space-y-3">
                {systemStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between text-sm">
                    <span className="text-white/50">{stat.label}</span>
                    <span className="text-white/80 font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-4">Key Endpoints</p>
              <div className="space-y-3 text-sm text-white/60">
                {endpointHighlights.map((endpoint) => (
                  <div key={endpoint.label} className="flex items-center justify-between">
                    <span>{endpoint.label}</span>
                    <span className="text-white/80 font-mono">{endpoint.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-white/[0.05] py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs font-mono tracking-widest uppercase">LocalAgent</p>
          <p className="text-white/15 text-xs">AI Complete Local Monetisation System · Total Intel · No Sub · Full Privacy</p>
        </div>
      </footer>
    </div>
  )
}
