'use client'

import Link from 'next/link'
import { Manrope } from 'next/font/google'

const manrope = Manrope({ subsets: ['latin'] })

export default function LandingPage() {
  return (
    <div className={`relative flex flex-col items-center justify-center w-full h-screen bg-[#080808] text-white overflow-hidden ${manrope.className}`}>
      <div className="z-10 text-center px-4">
        <h1 className="text-5xl font-bold max-w-4xl mx-auto leading-tight">
          Welcome to LocalAgent
        </h1>
        <p className="text-white/45 text-lg mt-5 max-w-2xl mx-auto">
          Your pure local AI agent powered by Ollama. Build revenue-ready workflows locally with full control.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-full bg-white text-black text-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Launch LocalAgent Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
