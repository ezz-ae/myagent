"use client"

import { useRouter } from "next/navigation"
import Interactive3DGrid from "@/components/Interactive3DGrid"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="h-screen w-full overflow-hidden relative flex flex-col">
      {/* 3D Interactive Grid Background - Full viewport */}
      <div className="flex-1 relative">
        <Interactive3DGrid
          className="h-full w-full"
          showOverlay={true}
          overlayContent={
            <div className="text-center space-y-8 pointer-events-auto">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-white">
                  LocalAgent
                </h1>
                <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
                  Your AI. Your machine. Your rules.
                </p>
              </div>

              <button
                onClick={() => router.push("/app")}
                className="bg-white text-black font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Launch App
              </button>

              <p className="text-sm text-white/50 max-w-md mx-auto">
                Spin the grid while exploring • Coming to a machine near you
              </p>
            </div>
          }
        />
      </div>

      {/* Footer - One-line Copy */}
      <div className="relative z-20 backdrop-blur-sm bg-[#000000]/60 border-t border-white/[0.1] px-8 py-4">
        <p className="text-center text-white/30 text-sm tracking-wide">
          One-time payment. Zero telemetry. Forever yours. Running locally, always.
        </p>
      </div>
    </div>
  )
}
