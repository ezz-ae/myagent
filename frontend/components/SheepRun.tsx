"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface Sheep {
  x: number
  y: number
  velocity: number
  width: number
  height: number
  onGround: boolean
  animFrame: number
}

interface Hazard {
  x: number
  y: number
  width: number
  height: number
  type: "bush" | "wolf"
}

const GRAVITY = 0.9
const JUMP_FORCE = -18
const GROUND_Y = 380
const SHEEP_WIDTH = 50
const SHEEP_HEIGHT = 50
const WOLF_WIDTH = 60
const WOLF_HEIGHT = 40

interface SheepRunProps {
  onGameOver?: (score: number) => void
  onStartPlaying?: () => void
}

export default function SheepRun({ onGameOver, onStartPlaying }: SheepRunProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const [gameState, setGameState] = useState<"playing" | "gameOver">("playing")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const autoRestartRef = useRef<NodeJS.Timeout>()

  const gameRef = useRef<{
    sheep: Sheep
    hazards: Hazard[]
    distance: number
    speed: number
  }>({
    sheep: {
      x: 80, y: GROUND_Y - SHEEP_HEIGHT, velocity: 0,
      width: SHEEP_WIDTH, height: SHEEP_HEIGHT, onGround: true, animFrame: 0,
    },
    hazards: [],
    distance: 0,
    speed: 6,
  })

  const drawSheep = (ctx: CanvasRenderingContext2D, sheep: Sheep) => {
    const legFrame = sheep.onGround ? Math.floor(sheep.animFrame / 4) % 2 : 0

    // Body
    ctx.fillStyle = "rgba(255,255,255,0.85)"
    ctx.beginPath()
    ctx.ellipse(
      sheep.x + sheep.width / 2, sheep.y + sheep.height / 2,
      sheep.width / 2, sheep.height / 2 - 5, 0, 0, Math.PI * 2
    )
    ctx.fill()

    // Head
    ctx.fillRect(sheep.x + sheep.width - 15, sheep.y + 10, 20, 15)
    // Ears
    ctx.fillRect(sheep.x + sheep.width - 10, sheep.y + 5, 5, 5)
    ctx.fillRect(sheep.x + sheep.width + 5, sheep.y + 5, 5, 5)

    // Legs
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    if (legFrame === 0) {
      ctx.fillRect(sheep.x + 10, sheep.y + sheep.height - 15, 10, 15)
      ctx.fillRect(sheep.x + 30, sheep.y + sheep.height - 15, 10, 15)
    } else {
      ctx.fillRect(sheep.x + 5, sheep.y + sheep.height - 15, 10, 15)
      ctx.fillRect(sheep.x + 35, sheep.y + sheep.height - 15, 10, 15)
    }

    // Eye
    ctx.fillStyle = "#080808"
    ctx.fillRect(sheep.x + sheep.width - 5, sheep.y + 15, 3, 3)
  }

  const drawBush = (ctx: CanvasRenderingContext2D, h: Hazard) => {
    ctx.fillStyle = "rgba(255,255,255,0.15)"
    ctx.beginPath()
    ctx.ellipse(h.x + h.width / 2, h.y + h.height / 2, h.width / 2, h.height / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "rgba(255,255,255,0.08)"
    ctx.lineWidth = 1
    ctx.stroke()
  }

  const drawWolf = (ctx: CanvasRenderingContext2D, h: Hazard, frame: number) => {
    const yOff = Math.sin(frame / 5) * 3
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.fillRect(h.x, h.y + 10 + yOff, h.width, h.height - 20)
    ctx.fillRect(h.x + h.width - 20, h.y + yOff, 20, 20)
    ctx.fillRect(h.x + h.width - 10, h.y + 15 + yOff, 10, 5)
    ctx.fillStyle = "rgba(255,255,255,0.15)"
    ctx.fillRect(h.x + 10, h.y + h.height - 10 + yOff, 5, 10)
    ctx.fillRect(h.x + h.width - 15, h.y + h.height - 10 + yOff, 5, 10)
  }

  const createHazard = useCallback((x: number) => {
    const isWolf = Math.random() > 0.65
    if (isWolf) {
      const wolfY = Math.random() > 0.5 ? GROUND_Y - 60 : GROUND_Y - 100
      gameRef.current.hazards.push({ x, y: wolfY, width: WOLF_WIDTH, height: WOLF_HEIGHT, type: "wolf" })
    } else {
      const sizes = [{ w: 30, h: 30 }, { w: 50, h: 30 }, { w: 70, h: 30 }]
      const s = sizes[Math.floor(Math.random() * sizes.length)]
      gameRef.current.hazards.push({ x, y: GROUND_Y - s.h, width: s.w, height: s.h, type: "bush" })
    }
  }, [])

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1)
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1)
    const ctx = canvas.getContext("2d")
    if (ctx) ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)

    gameRef.current = {
      sheep: {
        x: 80, y: GROUND_Y - SHEEP_HEIGHT, velocity: 0,
        width: SHEEP_WIDTH, height: SHEEP_HEIGHT, onGround: true, animFrame: 0,
      },
      hazards: [],
      distance: 0,
      speed: 6,
    }
    createHazard(canvas.offsetWidth)
  }, [createHazard])

  const jump = useCallback(() => {
    if (gameRef.current.sheep.onGround) {
      gameRef.current.sheep.velocity = JUMP_FORCE
      gameRef.current.sheep.onGround = false
    }
  }, [])

  // AI logic: detect upcoming hazards and auto-jump
  const shouldAutoJump = useCallback(() => {
    const sheep = gameRef.current.sheep
    const hazards = gameRef.current.hazards

    // Look ahead for hazards within jumping distance
    for (const hazard of hazards) {
      const distanceToHazard = hazard.x - (sheep.x + sheep.width)

      // If hazard is close and will hit us
      if (distanceToHazard > -20 && distanceToHazard < 120 && sheep.onGround) {
        // For high hazards (wolves), jump
        if (hazard.y < GROUND_Y - 80) {
          return true
        }
        // For low hazards (bushes), jump if on ground
        if (hazard.y >= GROUND_Y - 40) {
          return true
        }
      }
    }
    return false
  }, [])

  const startGame = useCallback(() => {
    setGameState("playing")
    setScore(0)
    initGame()
  }, [initGame])

  const endGame = useCallback(() => {
    setGameState("gameOver")
    const finalScore = Math.floor(gameRef.current.distance)
    if (finalScore > highScore) setHighScore(finalScore)
    setScore(finalScore)
    onGameOver?.(finalScore)

    // Auto-restart after 3 seconds
    autoRestartRef.current = setTimeout(() => {
      startGame()
    }, 3000)
  }, [highScore, onGameOver, startGame])

  const updateGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const g = gameRef.current
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight

    g.distance += g.speed / 10
    g.speed += 0.003
    g.sheep.animFrame++

    // AI: Auto-jump if hazard detected
    if (shouldAutoJump()) {
      jump()
    }

    // Clear
    ctx.fillStyle = "#080808"
    ctx.fillRect(0, 0, w, h)

    // Ground line
    ctx.strokeStyle = "rgba(255,255,255,0.06)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, GROUND_Y)
    ctx.lineTo(w, GROUND_Y)
    ctx.stroke()

    // Ground dots
    for (let i = 0; i < w; i += 40) {
      const offset = (g.sheep.animFrame * g.speed * 0.3) % 40
      ctx.fillStyle = "rgba(255,255,255,0.03)"
      ctx.fillRect(i - offset, GROUND_Y + 10, 1, 1)
    }

    // Update sheep
    g.sheep.velocity += GRAVITY
    g.sheep.y += g.sheep.velocity
    if (g.sheep.y + g.sheep.height >= GROUND_Y) {
      g.sheep.y = GROUND_Y - g.sheep.height
      g.sheep.velocity = 0
      g.sheep.onGround = true
    }
    drawSheep(ctx, g.sheep)

    // Update hazards
    for (let i = g.hazards.length - 1; i >= 0; i--) {
      const hz = g.hazards[i]
      hz.x -= g.speed
      if (hz.x + hz.width < 0) g.hazards.splice(i, 1)
      if (hz.type === "bush") drawBush(ctx, hz)
      else drawWolf(ctx, hz, g.sheep.animFrame)
    }

    // Spawn hazards
    if (!g.hazards.length || g.hazards[g.hazards.length - 1].x < w - 250 - Math.random() * 200) {
      createHazard(w)
    }

    // Collision
    for (const hz of g.hazards) {
      if (
        g.sheep.x < hz.x + hz.width && g.sheep.x + g.sheep.width > hz.x &&
        g.sheep.y < hz.y + hz.height && g.sheep.y + g.sheep.height > hz.y
      ) {
        endGame()
        return
      }
    }

    // Score
    ctx.fillStyle = "rgba(255,255,255,0.2)"
    ctx.font = "14px monospace"
    ctx.textAlign = "right"
    ctx.fillText(`HI ${highScore}  ${Math.floor(g.distance)}`, w - 20, 30)

    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(updateGame)
    }
  }, [gameState, highScore, createHazard, endGame, shouldAutoJump, jump])

  // Auto-start on mount
  useEffect(() => {
    initGame()
    startGame()
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      if (autoRestartRef.current) clearTimeout(autoRestartRef.current)
    }
  }, [initGame, startGame])

  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(updateGame)
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current) }
  }, [gameState, updateGame])

  useEffect(() => { initGame() }, [initGame])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />

      {/* Game over overlay - shows briefly before auto-restart */}
      {gameState === "gameOver" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#080808]/90 backdrop-blur-sm">
          <div className="text-center space-y-4 animate-pulse">
            <p className="text-sm text-white/30 uppercase tracking-widest">Game Over</p>
            <p className="text-4xl font-mono text-white/40">{score}</p>
            <p className="text-xs text-white/15">High Score: {highScore}</p>
            <p className="text-xs text-white/20 pt-2">Restarting in 3 seconds...</p>
          </div>
        </div>
      )}
    </div>
  )
}
