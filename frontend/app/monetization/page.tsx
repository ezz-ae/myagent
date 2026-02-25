"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  DollarSign, Mic, Phone, BarChart3, MessageSquare, FileText,
  Users, Globe, ChevronDown, ChevronRight, Zap, ShoppingBag,
} from "lucide-react"

const strategies = [
  {
    id: "consulting",
    title: "AI Consulting Services",
    icon: Users,
    color: "#A06CD5",
    earning: "$500–$5,000 / client",
    content: `Offer private AI consulting using PALMS as your backend. Clients pay for your expertise and a private, local AI setup with zero data leakage.

How to monetize:
• Charge a one-time setup fee ($500–$2,000) to deploy PALMS for a client
• Offer monthly retainers ($200–$500/mo) for prompt tuning and maintenance
• Upsell custom prompt libraries tailored to their business

Target clients:
• Law firms needing private document AI
• Medical practices needing HIPAA-compliant AI assistants
• Executives needing a private research assistant`,
  },
  {
    id: "voice",
    title: "AI Voice Campaigns",
    icon: Phone,
    color: "#10B981",
    earning: "$1,000–$10,000 / campaign",
    content: `Use the built-in Twilio AI Calling tool to run outbound voice campaigns for businesses. Charge per campaign or per lead generated.

Setup:
• Configure Twilio credentials in your .env
• Build a prompt that handles the call script
• Upload a contact list and launch from /app

Pricing models:
• Flat fee per campaign: $1,000–$5,000
• Per-lead pricing: $10–$50 per qualified lead
• Monthly retainer for ongoing campaigns: $1,500–$3,000/mo

Industries: Real estate, insurance, recruitment, event marketing.`,
  },
  {
    id: "content",
    title: "AI Content Agency",
    icon: FileText,
    color: "#F59E0B",
    earning: "$2,000–$20,000 / month",
    content: `Run a fully private content generation agency. Use PALMS with custom prompts to produce blog posts, ad copy, scripts, and social content.

Workflow:
• Build a library of niche-specific prompts in the Prompt Manager
• Use the Voice Generator to produce audio content
• Deliver content packages to clients weekly or monthly

Pricing:
• 10 blog posts/month: $500–$1,500
• Social media content package: $800–$2,000/month
• Full content retainer (blog + social + email): $2,000–$5,000/mo

No per-token API costs since everything runs locally.`,
  },
  {
    id: "saas",
    title: "White-Label AI Product",
    icon: Globe,
    color: "#4F46E5",
    earning: "$99–$499 / user / month",
    content: `Wrap PALMS in your own brand and sell it as a private AI SaaS product. You keep 100% of revenue.

How:
• Rebrand the interface (change logo, colors, app name)
• Host on a client's private server or VPS
• Charge monthly access fees per seat

Pricing tiers:
• Solo: $99/month (1 user)
• Team: $299/month (up to 5 users)
• Enterprise: $499+/month (unlimited + custom prompts)

Because PALMS is a one-time purchase, your profit margin on subscriptions is nearly 100% after server costs.`,
  },
  {
    id: "ads",
    title: "AI Ads & Marketing",
    icon: BarChart3,
    color: "#EC4899",
    earning: "$500–$8,000 / client",
    content: `Use the built-in Ads tool at /tools/ads to generate high-converting ad copy for clients. Charge per project or retainer.

Services you can offer:
• Facebook/Instagram ad copy: $200–$800 per set
• Google Ads copy + keyword strategy: $500–$1,500
• Full paid media creative package: $2,000–$5,000

Workflow:
• Intake client brief
• Generate 10–20 variations using PALMS
• Deliver formatted in Google Doc or PDF

Because you generate copy in seconds, you can handle 10–20 clients per month with minimal effort.`,
  },
  {
    id: "voice-products",
    title: "Audio & Podcast Products",
    icon: Mic,
    color: "#0891B2",
    earning: "$200–$2,000 / product",
    content: `Use the Voice Generator to create and sell audio products: meditation tracks, educational recordings, narrated guides, podcast intros.

Products you can sell:
• Narrated e-books: $50–$200 per chapter set
• Meditation / affirmation packs: $19–$97 per pack
• Custom brand voiceovers: $100–$500 per script
• Podcast intro/outro packages: $150–$500

Platforms to sell on:
• Gumroad, Payhip, Ko-fi (digital downloads)
• Fiverr, Upwork (freelance services)
• Your own landing page (highest margin)`,
  },
  {
    id: "prompt-packs",
    title: "Prompt Packs & Templates",
    icon: Zap,
    color: "#EF4444",
    earning: "$27–$297 / pack",
    content: `Build and sell prompt packs using the Prompt Manager. Export and package them as downloadable products for other PALMS users or general AI users.

Ideas:
• Niche-specific prompt packs (real estate, law, fitness, finance)
• "Done-for-you" business prompt kits
• Prompt libraries for specific use cases (hiring, sales, support)

Pricing:
• Starter pack (10 prompts): $27–$47
• Pro pack (50 prompts): $97–$197
• Full business kit (100+ prompts): $197–$297

Sell on Gumroad, Etsy, or your own site. Once built, fully passive income.`,
  },
  {
    id: "training",
    title: "Courses & Training",
    icon: ShoppingBag,
    color: "#CA8A04",
    earning: "$197–$997 / student",
    content: `Teach others how to use PALMS to start their own AI businesses. Your operational knowledge is itself a product.

Course formats:
• Self-paced video course: $197–$497
• Live cohort (group coaching): $497–$997
• 1-on-1 mentorship sessions: $150–$300/hr

Topics to teach:
• How to set up PALMS from scratch
• Building a local AI consulting business
• Using PALMS for content creation
• Running AI voice campaigns with Twilio

Platforms: Gumroad, Teachable, Skool, or self-hosted.`,
  },
]

const revenueSignals = [
  { label: "Active revenue lanes", value: "8 streams" },
  { label: "Best first offer", value: "$500 setup" },
  { label: "Fastest payback", value: "Voice campaigns" },
  { label: "Recurring baseline", value: "$100-$300/mo" },
]

const monetizationChecklist = [
  "Pick 1 lane and craft a simple offer",
  "Build 3 demos inside LocalAgent",
  "Package delivery with a 24h turnaround",
  "Collect first payment before scaling",
]

function StrategyCard({ strategy }: { strategy: (typeof strategies)[0] }) {
  const [open, setOpen] = useState(false)
  const Icon = strategy.icon

  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${strategy.color}15`, border: `1px solid ${strategy.color}25` }}
          >
            <Icon className="w-4 h-4" style={{ color: strategy.color }} />
          </div>
          <div>
            <span className="text-white/80 font-medium text-sm">{strategy.title}</span>
            <span className="ml-3 text-xs font-mono" style={{ color: strategy.color }}>{strategy.earning}</span>
          </div>
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
            {strategy.content}
          </pre>
        </motion.div>
      )}
    </div>
  )
}

export default function MonetizationPage() {
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
            <button onClick={() => router.push("/orchestration")} className="text-white/40 text-sm hover:text-white/60 transition-colors">Orchestration</button>
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
                Monetization
              </p>
              <h1 className="text-4xl font-bold mb-4">Turn PALMS Into Revenue</h1>
              <p className="text-white/40 text-base leading-relaxed max-w-2xl">
                Eight proven income streams using your private local AI system. Click any strategy to expand.
              </p>
            </motion.div>

            <div className="space-y-3">
              {strategies.map((strategy, i) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <StrategyCard strategy={strategy} />
                </motion.div>
              ))}
            </div>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/docs")}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <div>
                  <p className="text-white/70 font-medium text-sm mb-0.5">Documentation</p>
                  <p className="text-white/35 text-xs">System reference & setup</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
              </button>
              <button
                onClick={() => router.push("/orchestration")}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <div>
                  <p className="text-white/70 font-medium text-sm mb-0.5">Orchestration</p>
                  <p className="text-white/35 text-xs">Automate AI workflows</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-5">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-4">Revenue Signals</p>
              <div className="space-y-3">
                {revenueSignals.map((signal) => (
                  <div key={signal.label} className="flex items-center justify-between text-sm">
                    <span className="text-white/50">{signal.label}</span>
                    <span className="text-white/85 font-medium">{signal.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-4">Launch Checklist</p>
              <div className="space-y-3 text-sm text-white/60">
                {monetizationChecklist.map((item) => (
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
