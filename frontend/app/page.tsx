"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SheepRun from "@/components/SheepRun"

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const enterApp = () => {
    router.push("/app")
  }

  return (
    <div className="h-screen w-full bg-[#080808] overflow-hidden relative flex flex-col">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
            <span className="text-sm font-bold text-white/50">LA</span>
          </div>
          <span className="text-sm font-medium text-white/40 tracking-wide">LocalAgent</span>
        </div>
        <button
          onClick={enterApp}
          className="px-4 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs font-medium hover:bg-white/[0.1] hover:text-white/70 transition-all"
        >
          Enter App →
        </button>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-8 pb-4 px-8">
        <div
          className={`transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-center leading-tight max-w-3xl mx-auto">
            <span className="text-white/85">Your AI.</span>{" "}
            <span className="text-white/45">Your Machine.</span>{" "}
            <span className="text-white/25">Your Rules.</span>
          </h1>
          <p className="text-center text-white/25 text-lg mt-6 max-w-lg mx-auto leading-relaxed">
            A powerful, private AI agent that runs entirely on your machine.
            No cloud. No limits. No subscription.
          </p>
        </div>

        <div
          className={`flex gap-4 mt-8 transition-all duration-1000 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={enterApp}
            className="px-6 py-2.5 rounded-xl bg-white/[0.1] border border-white/[0.12] text-white/75 text-sm font-medium hover:bg-white/[0.15] hover:text-white transition-all"
          >
            Start Playing
          </button>
          <div className="flex items-center gap-2 px-4 py-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500/60 animate-pulse" />
            <span className="text-xs text-white/25">100% Local</span>
          </div>
        </div>
      </div>

      {/* Sheep Run Game Section */}
      <div
        className={`flex-1 relative mx-8 mb-8 rounded-2xl overflow-hidden border border-white/[0.05] transition-all duration-1000 delay-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <SheepRun
          onGameOver={(score) => {
            // Game over triggers CTA
          }}
          onStartPlaying={enterApp}
        />
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-center pb-6 gap-6">
        <span className="text-[10px] text-white/12 uppercase tracking-widest">
          Powered by Ollama
        </span>
        <span className="text-white/06">|</span>
        <span className="text-[10px] text-white/12 uppercase tracking-widest">
          One-time payment
        </span>
        <span className="text-white/06">|</span>
        <span className="text-[10px] text-white/12 uppercase tracking-widest">
          Zero telemetry
        </span>
      </div>
    </div>
  )
}
