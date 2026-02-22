"use client"

import { useRouter } from "next/navigation"
import SheepRun from "@/components/SheepRun"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div
      className="h-screen w-full overflow-hidden relative flex flex-col"
      style={{
        background: "linear-gradient(180deg, #1a1428 0%, #2a2340 25%, #3a3360 50%, #2a2540 75%, #0a0a1a 100%)"
      }}
    >

      {/* Game - Full viewport */}
      <div className="flex-1 relative z-10 flex flex-col">
        <div className="flex-1 relative">
          <SheepRun
            onGameOver={() => {}}
            onStartPlaying={() => router.push("/app")}
          />
        </div>
      </div>

      {/* Footer - One-line Copy */}
      <div className="relative z-20 backdrop-blur-sm bg-[#000000]/40 border-t border-white/[0.05] px-8 py-4">
        <p className="text-center text-white/30 text-sm tracking-wide">
          Your AI. Your machine. Your rules. One-time payment. Zero telemetry. Forever yours.
        </p>
      </div>
    </div>
  )
}
