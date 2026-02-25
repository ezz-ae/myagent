"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Workflow, Cpu, GitBranch, Timer, Database, Layers,
  RefreshCw, ChevronDown, ChevronRight, Terminal, Zap,
} from "lucide-react"

const sections = [
  {
    id: "overview",
    title: "What is Orchestration?",
    icon: Layers,
    color: "#A06CD5",
    content: `Orchestration in PALMS means chaining AI tasks together into automated pipelines — each step feeds output into the next with no manual intervention.

Instead of asking the AI a single question, you build sequences:
  Input → Classify → Enrich → Generate → Deliver

Examples:
• Ingest a customer query → classify intent → generate reply → log to session
• Receive a lead → research company → draft outreach → queue for voice call
• Get a prompt → generate content → convert to audio → archive in recordings

PALMS orchestration runs entirely on your machine. No third-party orchestration platform required.`,
  },
  {
    id: "sessions",
    title: "Session-Based Pipelines",
    icon: Database,
    color: "#10B981",
    content: `Each session in PALMS acts as a scoped execution context. Sessions store:
  • Message history (messages.jsonl)
  • Active prompts
  • Secrets and credentials
  • Linked files and recordings

To build a pipeline using sessions:
  1. Create a session via POST /v1/sessions
  2. Attach prompts that define the pipeline role
  3. Send messages in sequence — each builds on prior context
  4. Archive or export session output when complete

Sessions persist indefinitely. You can resume any pipeline exactly where it stopped.

Use the Dashboard (/dashboard) to monitor active sessions and their state.`,
  },
  {
    id: "prompts",
    title: "Prompt Chaining",
    icon: GitBranch,
    color: "#4F46E5",
    content: `The Prompt Manager supports multi-role prompt stacking. Combine prompt types to define a pipeline:

Example chain:
  LEARN prompt  → inject domain knowledge (e.g. "You are a legal researcher")
  TASK prompt   → define the operation ("Summarize this contract clause")
  ROLES prompt  → assign output format ("Format output as bullet points")

Each prompt is injected into the message context in order. The AI processes them as a unified instruction set.

To set up a chain:
  1. Go to /app → Prompts
  2. Create each prompt with the appropriate type
  3. Activate them together for a session
  4. Send your first input — the chain executes automatically

Chains can be saved as templates and reused across sessions.`,
  },
  {
    id: "automation",
    title: "API Automation",
    icon: RefreshCw,
    color: "#F59E0B",
    content: `PALMS exposes a full REST API on port 8000. You can drive any workflow from external scripts, cron jobs, or third-party tools.

Key endpoints for automation:
  POST /v1/chat                      — Send a message and get a response
  POST /v1/sessions                  — Create a new session
  GET  /v1/sessions/{id}/messages    — Retrieve conversation history
  POST /v1/speech                    — Convert text to audio
  POST /v1/sessions/{id}/prompts     — Attach a prompt to a session

Automation example (Python):
  1. Create a session
  2. POST a batch of inputs to /v1/chat
  3. Collect all responses
  4. POST to /v1/speech to generate audio for each
  5. Archive with session metadata

Run automation scripts via cron for fully scheduled pipelines.`,
  },
  {
    id: "voice-pipeline",
    title: "Voice Orchestration",
    icon: Zap,
    color: "#EC4899",
    content: `Combine chat, voice generation, and calling into a single automated voice pipeline:

Pipeline steps:
  1. Input: Receive a lead name, phone number, and context
  2. Generate: POST to /v1/chat with a call script prompt
  3. Synthesize: POST generated script to /v1/speech
  4. Call: Use Twilio integration to deliver the audio call
  5. Log: Store outcome in session history

This pipeline can process a full contact list overnight with zero manual steps.

Configuration:
  • Prompt: Define the call tone and content
  • Voice: Select language in the Voice Generator
  • Twilio: Credentials set in .env

Use the /tools/comfyui or /tools/ads endpoints for additional media generation in the pipeline.`,
  },
  {
    id: "memory-pipeline",
    title: "Memory-Augmented Pipelines",
    icon: Cpu,
    color: "#0891B2",
    content: `Cross-session memory turns PALMS into a persistent intelligence system. Memory entries are injected automatically into every chat request.

Use memory to make pipelines context-aware:
  • Store client preferences ("Client X prefers short responses")
  • Store business facts ("Our pricing is $500 setup + $200/month")
  • Store workflow states ("Last batch processed: 2024-01-15")

Memory pipeline example:
  1. Run a research session — store findings to memory
  2. Next session auto-inherits the research context
  3. Build on prior output without re-providing context

Memory API:
  GET  /v1/memory          — Read all memory
  POST /v1/memory          — Add entry {content, category}
  DELETE /v1/memory/{id}   — Remove entry

This creates compounding intelligence — each pipeline run makes the system smarter.`,
  },
  {
    id: "scheduling",
    title: "Scheduled Workflows",
    icon: Timer,
    color: "#6366F1",
    content: `PALMS does not include a built-in scheduler, but integrates trivially with system-level scheduling tools.

macOS / Linux (cron):
  # Run a pipeline every morning at 8am
  0 8 * * * python3 /path/to/pipeline.py >> /var/log/palms.log 2>&1

Windows (Task Scheduler):
  • Create a Basic Task
  • Set trigger to Daily at desired time
  • Action: Start python.exe with your pipeline script

What to schedule:
  • Daily content generation runs
  • Nightly lead processing batches
  • Weekly report generation and archiving
  • Recurring client update emails (drafted by AI, reviewed by you)

All outputs are stored locally and accessible in the Dashboard.`,
  },
  {
    id: "dashboard",
    title: "Monitoring & Dashboard",
    icon: Terminal,
    color: "#CA8A04",
    content: `The Dashboard (/dashboard) provides a live view of all pipeline activity:

Views available:
  • Sessions — all active and archived pipelines
  • Activity — chronological log of all events
  • Prompts — active prompt configurations per session
  • Recordings — generated audio outputs
  • Settings — system configuration

Use the Dashboard to:
  • Monitor pipeline execution across sessions
  • Review AI outputs before delivery to clients
  • Export session transcripts as reports
  • Track voice recording outputs per campaign

Access the Dashboard at http://localhost:3000/dashboard.`,
  },
]

const orchestrationStats = [
  { label: "Pipeline model", value: "Session-based" },
  { label: "Memory scope", value: "Cross-session" },
  { label: "Automation", value: "REST API" },
  { label: "Scheduling", value: "Cron / Task" },
]

const pipelineChecklist = [
  "Create a session for each workflow",
  "Attach prompt chain for context",
  "Send inputs sequentially via API",
  "Archive outputs in dashboard",
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

export default function OrchestrationPage() {
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
            ← PALMS
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/docs")} className="text-white/40 text-sm hover:text-white/60 transition-colors">Docs</button>
            <button onClick={() => router.push("/monetization")} className="text-white/40 text-sm hover:text-white/60 transition-colors">Monetization</button>
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
                Orchestration
              </p>
              <h1 className="text-4xl font-bold mb-4">Automate AI Pipelines Locally</h1>
              <p className="text-white/40 text-base leading-relaxed max-w-2xl">
                Chain AI tasks into fully automated workflows — all running privately on your machine.
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

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/monetization")}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <div>
                  <p className="text-white/70 font-medium text-sm mb-0.5">Monetization</p>
                  <p className="text-white/35 text-xs">Turn pipelines into revenue</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
              </button>
              <button
                onClick={() => router.push("/docs")}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <div>
                  <p className="text-white/70 font-medium text-sm mb-0.5">Documentation</p>
                  <p className="text-white/35 text-xs">API reference & setup</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-transparent p-5">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-4">Pipeline Signals</p>
              <div className="space-y-3">
                {orchestrationStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between text-sm">
                    <span className="text-white/50">{stat.label}</span>
                    <span className="text-white/85 font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-4">Pipeline Checklist</p>
              <div className="space-y-3 text-sm text-white/60">
                {pipelineChecklist.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-white/40">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-white/[0.05] py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs font-mono tracking-widest uppercase">PALMS</p>
          <p className="text-white/15 text-xs">Private AI Local Monetization System · Zero Telemetry · Full Privacy</p>
        </div>
      </footer>
    </div>
  )
}
