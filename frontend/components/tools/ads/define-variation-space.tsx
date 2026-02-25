"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Minus, Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CreativeIntent } from "@/app/page"
import type { VariationAxis } from "@/components/tools/ads/reality-check"

interface DefineVariationSpaceProps {
  intent: CreativeIntent
  setIntent: (intent: CreativeIntent) => void
  onComplete: (axes: VariationAxis[]) => void
  onBack: () => void
}

const INITIAL_AXES: VariationAxis[] = [
  {
    dimension: "hook",
    label: "Hook Style",
    range: 3,
    hypothesis: "Testing attention-grabbing openings",
    examples: ["Question opener", "Bold statement", "Visual pattern interrupt"],
  },
  {
    dimension: "actor",
    label: "Actor/Talent",
    range: 2,
    hypothesis: "Testing demographic resonance",
    examples: ["Male professional", "Younger talent"],
  },
  {
    dimension: "environment",
    label: "Environment",
    range: 3,
    hypothesis: "Testing context relevance",
    examples: ["Coffee shop", "Commute", "Living room"],
  },
  {
    dimension: "pacing",
    label: "Pacing",
    range: 2,
    hypothesis: "Testing engagement patterns",
    examples: ["Slower, editorial", "Quick cuts"],
  },
]

export function DefineVariationSpace({ intent, onComplete, onBack }: DefineVariationSpaceProps) {
  const [axes, setAxes] = useState<VariationAxis[]>(
    INITIAL_AXES.filter((a) => {
      const dim = intent.flexibleDimensions[a.dimension as keyof typeof intent.flexibleDimensions]
      return dim && !dim.locked
    }),
  )

  const updateRange = (index: number, delta: number) => {
    setAxes((prev) =>
      prev.map((axis, i) => {
        if (i === index) {
          const newRange = Math.max(1, Math.min(5, axis.range + delta))
          return { ...axis, range: newRange }
        }
        return axis
      }),
    )
  }

  const totalVariations = axes.reduce((acc, axis) => acc * (axis.range + 1), 1)
  const estimatedClusters = axes.length

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <p className="text-accent text-sm font-medium tracking-wide uppercase mb-3">Step 3</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4 text-balance">
            Define Variation Space
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Control how far each dimension can vary. Higher range = more creative exploration.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {axes.map((axis, index) => (
              <div key={axis.dimension} className="p-6 rounded-lg bg-card border border-border">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-medium text-card-foreground mb-1">{axis.label}</h3>
                    <p className="text-sm text-muted-foreground">{axis.hypothesis}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateRange(index, -1)}
                      className="w-8 h-8 rounded-md bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-foreground" />
                    </button>
                    <span className="w-8 text-center font-mono text-foreground">{axis.range}</span>
                    <button
                      onClick={() => updateRange(index, 1)}
                      className="w-8 h-8 rounded-md bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "flex-1 h-2 rounded-full transition-colors",
                        level <= axis.range ? "bg-accent" : "bg-secondary",
                      )}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {axis.examples.slice(0, axis.range).map((example, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-lg bg-card border border-border">
              <h3 className="font-medium text-card-foreground mb-4">Generation Preview</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Variations</span>
                  <span className="font-mono text-2xl text-foreground">{totalVariations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hypothesis Clusters</span>
                  <span className="font-mono text-2xl text-foreground">{estimatedClusters}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Variations are grouped by hypothesis, not listed individually. Review will be fast regardless of
                    count.
                  </p>
                </div>
              </div>
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
          <Button onClick={() => onComplete(axes)} className="gap-2">
            Preview Variations
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
