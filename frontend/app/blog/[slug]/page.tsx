"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, DollarSign, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react"
import { getBlogPost, blogPosts } from "@/lib/blog-data"

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = typeof params?.slug === "string" ? params.slug : ""
  const post = getBlogPost(slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center">
        <p className="text-white/40 mb-4">Guide not found.</p>
        <button
          onClick={() => router.push("/blog")}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          ← Back to Money Guides
        </button>
      </div>
    )
  }

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/blog")}
            className="flex items-center gap-2 text-white/40 text-xs font-mono tracking-[0.2em] uppercase hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Money Guides
          </button>
          <button
            onClick={() => router.push("/monetization")}
            className="text-xs font-medium px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
          >
            Monetization playbooks →
          </button>
        </div>
      </nav>

      {/* Article */}
      <article className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {/* Category + earn badge */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${post.color}15`, color: post.color }}
              >
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/35">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/35">
                <DollarSign className="w-3 h-3" />
                {post.earnings}
              </span>
            </div>

            {/* Title */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{post.icon}</span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</h1>
            </div>

            <p className="text-white/50 text-xl mb-10 leading-relaxed">{post.subtitle}</p>

            {/* Divider */}
            <div className="border-t border-white/[0.07] mb-10" />
          </motion.div>

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-white/65 text-base leading-[1.8] mb-12">{post.intro}</p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-10 mb-14">
            {post.sections.map((section, i) => (
              <motion.div
                key={section.heading}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.07 }}
              >
                <h2 className="text-white/85 font-semibold text-xl mb-3 flex items-center gap-2">
                  <span
                    className="w-1.5 h-5 rounded-sm inline-block shrink-0"
                    style={{ backgroundColor: post.color }}
                  />
                  {section.heading}
                </h2>
                <p className="text-white/50 leading-[1.8] text-sm pl-4">{section.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Money Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 mb-14"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${post.color}15` }}
              >
                <DollarSign className="w-4 h-4" style={{ color: post.color }} />
              </div>
              <div>
                <p className="text-xs font-mono tracking-[0.2em] text-white/30 uppercase">Action Plan</p>
                <h3 className="text-white/85 font-semibold">5 steps to your first dollar</h3>
              </div>
            </div>

            <ol className="space-y-4">
              {post.moneySteps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: `${post.color}20`, color: post.color }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Tools Used */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-14"
          >
            <p className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase mb-4">
              Tools Used
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tools.map((tool) => (
                <span
                  key={tool}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-white/50"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400/60" />
                  {tool}
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.7 }}
            className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-8 text-center"
          >
            <p className="text-white/85 font-semibold text-xl mb-2">
              Ready to implement this?
            </p>
            <p className="text-white/40 text-sm mb-6">
              Get the complete system deployed to your machine in 24 hours. All 8 tools, one payment.
            </p>
            <button
              onClick={() => router.push("/monetization")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors"
            >
              Get LocalAgent — $297
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-white/20 text-xs mt-3">
              One-time payment · Deployed in 24h · Zero subscription
            </p>
          </motion.div>
        </div>
      </article>

      {/* Related Guides */}
      <section className="pb-20 px-6 border-t border-white/[0.05] pt-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase mb-8 text-center">
            More Money Guides
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {related.map((p) => (
              <button
                key={p.slug}
                onClick={() => router.push(`/blog/${p.slug}`)}
                className="text-left group rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{p.icon}</span>
                  <span
                    className="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${p.color}15`, color: p.color }}
                  >
                    {p.earnings}
                  </span>
                </div>
                <h3 className="text-white/75 font-medium text-sm mb-1 group-hover:text-white/90 transition-colors">
                  {p.title}
                </h3>
                <p className="text-white/30 text-xs leading-relaxed">{p.subtitle}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-white/25 group-hover:text-white/40 transition-colors">
                  Read guide <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs font-mono tracking-widest uppercase">LocalAgent</p>
          <p className="text-white/15 text-xs">AI Complete Local Monetisation System</p>
          <div className="flex items-center gap-5 text-xs text-white/20">
            <button onClick={() => router.push("/")} className="hover:text-white/40 transition-colors">Home</button>
            <button onClick={() => router.push("/blog")} className="hover:text-white/40 transition-colors">Blog</button>
            <button onClick={() => router.push("/monetization")} className="hover:text-white/40 transition-colors">Monetization</button>
            <button onClick={() => router.push("/app")} className="hover:text-white/40 transition-colors">Launch</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
