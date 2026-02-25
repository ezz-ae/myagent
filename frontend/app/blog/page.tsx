"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react"
import { blogPosts } from "@/lib/blog-data"

export default function BlogPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const post = blogPosts[current]

  const go = (next: number) => {
    setDirection(next > current ? 1 : -1)
    setCurrent(next)
  }

  const prev = () => { if (current > 0) go(current - 1) }
  const next = () => { if (current < blogPosts.length - 1) go(current + 1) }

  return (
    <div className="h-screen w-screen bg-[#080808] text-white overflow-hidden flex flex-col">
      {/* Nav */}
      <nav className="shrink-0 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-white/40 text-xs font-mono tracking-[0.25em] uppercase hover:text-white/70 transition-colors"
          >
            ← PALMS
          </button>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {blogPosts.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? "20px" : "6px",
                  height: "6px",
                  backgroundColor: i === current ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => router.push("/monetization")}
            className="text-xs font-medium px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
          >
            Monetization playbooks →
          </button>
        </div>
      </nav>

      {/* Full screen card */}
      <div className="flex-1 relative flex items-stretch justify-center px-6 md:px-10 py-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: post.color }}
          />
          <div
            className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full blur-[140px] opacity-20"
            style={{ backgroundColor: post.color }}
          />
        </div>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -80 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-6xl flex"
          >
            {/* Stock lighting card */}
            <div
              className="relative rounded-3xl border border-white/[0.09] bg-white/[0.02] p-10 md:p-14 overflow-hidden cursor-pointer w-full"
              onClick={() => router.push(`/blog/${post.slug}`)}
            >
              {/* Top light edge */}
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)" }}
              />
              {/* Top light wash */}
              <div
                className="absolute inset-x-0 top-0 h-48 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.055) 0%, transparent 100%)" }}
              />
              {/* Side light */}
              <div
                className="absolute inset-y-0 left-0 w-px"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)" }}
              />

              <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="flex flex-col justify-between gap-10">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{post.icon}</span>
                        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30">
                          {post.category}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-white/20">
                        {String(current + 1).padStart(2, "0")} / {String(blogPosts.length).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Center content */}
                  <div>
                    <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
                      {post.title}
                    </h2>
                    <p className="text-white/50 text-lg md:text-xl leading-relaxed max-w-2xl">
                      {post.subtitle}
                    </p>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium group">
                    Read full guide
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/35 mb-3">Profit Window</p>
                    <p className="text-3xl font-semibold text-white">{post.earnings}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/40">
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <span>{post.moneySteps.length} action steps</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/[0.1] bg-white/[0.02] p-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/35 mb-3">Tool Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tools.map((tool) => (
                        <span
                          key={tool}
                          className="text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
                          style={{
                            color: post.color,
                            borderColor: `${post.color}55`,
                            backgroundColor: `${post.color}12`,
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev arrow */}
        <button
          onClick={prev}
          disabled={current === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all disabled:opacity-0 disabled:pointer-events-none"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          disabled={current === blogPosts.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all disabled:opacity-0 disabled:pointer-events-none"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
