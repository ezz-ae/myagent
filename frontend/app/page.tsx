"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import SheepRun from "@/components/SheepRun"

export default function LandingPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Animated dark afternoon background with moving clouds
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let time = 0
    const clouds = Array.from({ length: 5 }, (_, i) => ({
      x: (i * 300) % (canvas.width + 200),
      y: (30 + i * 40) % 200,
      size: 80 + i * 20,
      speed: 0.3 + i * 0.1,
    }))

    const animate = () => {
      time += 0.016

      // Dark afternoon sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(30, 20, 40, 0.95)") // Dark purple top
      gradient.addColorStop(0.3, "rgba(40, 35, 60, 0.95)") // Deep blue
      gradient.addColorStop(0.7, "rgba(50, 45, 80, 0.95)") // Darker
      gradient.addColorStop(1, "rgba(20, 25, 45, 0.95)") // Near black bottom

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Subtle animated stars/particles
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)"
      for (let i = 0; i < 50; i++) {
        const x = ((i * 137) % canvas.width + time * 5) % canvas.width
        const y = ((i * 211) % (canvas.height * 0.6)) + 50
        const size = 1 + Math.sin(time + i) * 0.5
        ctx.fillRect(x, y, size, size)
      }

      // Moving clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
      for (const cloud of clouds) {
        const x = (cloud.x + time * cloud.speed) % (canvas.width + 200)

        // Simple cloud shape
        ctx.beginPath()
        ctx.arc(x, cloud.y, cloud.size, 0, Math.PI * 2)
        ctx.arc(x + cloud.size * 0.6, cloud.y - cloud.size * 0.3, cloud.size * 0.8, 0, Math.PI * 2)
        ctx.arc(x + cloud.size * 1.2, cloud.y, cloud.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Subtle pulsing overlay effect
      ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + Math.sin(time * 0.5) * 0.05})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <div className="h-screen w-full overflow-hidden relative flex flex-col bg-[#080808]">
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ display: "block" }}
      />

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
