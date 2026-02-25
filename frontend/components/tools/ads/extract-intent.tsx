"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CreativeIntent } from "@/app/page"

interface ExtractIntentProps {
  adId: string
  onComplete: (intent: CreativeIntent) => void
  onBack: () => void
}

const MOCK_INTENT: CreativeIntent = {
  nonNegotiables: {
    coreMessage: "Transform your morning routine in 30 seconds",
    promise: "Save 2 hours every week with our streamlined system",
    proof: "Used by 50,000+ professionals",
  },
  flexibleDimensions: {
    hook: { value: "Problem-agitate opening", locked: false },
    actor: { value: "Professional woman, 30s", locked: false },
    environment: { value: "Modern home office", locked: false },
    format: { value: "Vertical 9:16", locked: true },
    pacing: { value: "Fast cuts, 2-3 sec scenes", locked: false },
    script: { value: "Conversational, direct address", locked: false },
    voiceover: { value: "Female, confident, warm", locked: false },
    onScreenText: { value: "Bold headlines, minimal", locked: false },
  },
}

export function ExtractIntent({ adId, onComplete, onBack }: ExtractIntentProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [intent, setIntent] = useState<CreativeIntent | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setIsAnalyzing(false)
          setIntent(MOCK_INTENT)
          return 100
        }
        return prev + 2
      })
    }, 40)

    return () => clearInterval(timer)
  }, [])

  const toggleLock = (dimension: keyof CreativeIntent["flexibleDimensions"]) => {
    if (!intent) return
    setIntent({
      ...intent,
      flexibleDimensions: {
        ...intent.flexibleDimensions,
        [dimension]: {
          ...intent.flexibleDimensions[dimension],
          locked: !intent.flexibleDimensions[dimension].locked,
        },
      },
    })
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Extracting Creative Intent</h2>
          <p className="text-muted-foreground mb-8">
            Decomposing your ad into non-negotiables and flexible dimensions...
          </p>
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-muted-foreground mt-3">{progress}%</p>
        </div>
      </div>
    )
  }

  if (!intent) return null

  const dimensionLabels: Record<keyof CreativeIntent["flexibleDimensions"], string> = {
    hook: "Hook Style",
    actor: "Actor/Talent",
    environment: "Environment",
    format: "Format",
    pacing: "Pacing",
    script: "Script Style",
    voiceover: "Voiceover",
    onScreenText: "On-Screen Text",
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <p className="text-accent text-sm font-medium tracking-wide uppercase mb-3">Step 2</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4 text-balance">
            Creative Intent Extracted
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            We&apos;ve identified what makes your ad work. Lock dimensions you don&apos;t want to change.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Non-negotiables */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-medium text-accent uppercase tracking-wide">Non-Negotiables</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              These elements define your ad&apos;s core identity and will remain constant across all variations.
            </p>

            <div className="space-y-3">
              {Object.entries(intent.nonNegotiables).map(([key, value]) => (
                <div key={key} className="p-4 rounded-lg bg-card border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {key === "coreMessage" ? "Core Message" : key === "promise" ? "Promise" : "Proof"}
                  </p>
                  <p className="text-card-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Flexible Dimensions */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Flexible Dimensions
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Click to lock/unlock dimensions. Locked dimensions won&apos;t be varied.
            </p>

            <div className="space-y-2">
              {(
                Object.entries(intent.flexibleDimensions) as [
                  keyof CreativeIntent["flexibleDimensions"],
                  { value: string; locked: boolean },
                ][]
              ).map(([key, dim]) => (
                <button
                  key={key}
                  onClick={() => toggleLock(key)}
                  className={cn(
                    "w-full p-4 rounded-lg border transition-all duration-200 text-left flex items-center justify-between gap-4",
                    dim.locked ? "bg-secondary/50 border-border" : "bg-card border-accent/30 hover:border-accent",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{dimensionLabels[key]}</p>
                    <p className={cn("truncate", dim.locked ? "text-muted-foreground" : "text-card-foreground")}>
                      {dim.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                      dim.locked ? "bg-muted" : "bg-accent/10",
                    )}
                  >
                    <Lock className={cn("w-4 h-4", dim.locked ? "text-muted-foreground" : "text-accent")} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {Object.values(intent.flexibleDimensions).filter((d) => !d.locked).length} dimensions unlocked for
              variation
            </p>
            <Button onClick={() => onComplete(intent)} className="gap-2">
              Define Variation Space
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
