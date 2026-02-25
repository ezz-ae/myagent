"use client"

import { useState, useEffect } from "react"
import { Sparkles, Layers, CheckCircle2 } from "lucide-react"
import type { CreativeIntent, VariationCluster } from "@/app/page"

interface GeneratePacksProps {
  intent: CreativeIntent
  onComplete: (clusters: VariationCluster[]) => void
}

const GENERATION_STEPS = [
  { label: "Analyzing creative constraints", duration: 800 },
  { label: "Mapping variation space", duration: 1000 },
  { label: "Generating hook variations", duration: 1200 },
  { label: "Generating environment variations", duration: 1000 },
  { label: "Generating pacing variations", duration: 800 },
  { label: "Clustering by hypothesis", duration: 600 },
  { label: "Quality validation", duration: 500 },
]

const MOCK_CLUSTERS: VariationCluster[] = [
  {
    id: "cluster-1",
    hypothesis: "Question-based hooks drive higher watch time",
    dimension: "hook",
    variationCount: 18,
    approved: null,
    variations: [
      { id: "v1", thumbnail: "/question-hook-ad-variant.jpg", description: "Opens with 'Ever feel like...'" },
      { id: "v2", thumbnail: "/hook-variation-ad.jpg", description: "Opens with 'What if you could...'" },
      { id: "v3", thumbnail: "/ad-creative-variant.jpg", description: "Opens with 'Why do most people...'" },
    ],
  },
  {
    id: "cluster-2",
    hypothesis: "Relatable environments increase conversion",
    dimension: "environment",
    variationCount: 24,
    approved: null,
    variations: [
      { id: "v4", thumbnail: "/coffee-shop-ad-scene.jpg", description: "Coffee shop setting" },
      { id: "v5", thumbnail: "/home-office-ad-scene.jpg", description: "Kitchen morning routine" },
      { id: "v6", thumbnail: "/commute-ad-scene.jpg", description: "Commute/transit scene" },
    ],
  },
  {
    id: "cluster-3",
    hypothesis: "Faster pacing improves scroll-stop rate",
    dimension: "pacing",
    variationCount: 12,
    approved: null,
    variations: [
      { id: "v7", thumbnail: "/fast-paced-ad-edit.jpg", description: "1.5s average cut length" },
      { id: "v8", thumbnail: "/quick-cuts-ad.jpg", description: "2s with visual effects" },
      { id: "v9", thumbnail: "/dynamic-ad-pacing.jpg", description: "Variable rhythm pattern" },
    ],
  },
  {
    id: "cluster-4",
    hypothesis: "Demographic diversity expands reach",
    dimension: "actor",
    variationCount: 16,
    approved: null,
    variations: [
      { id: "v10", thumbnail: "/male-professional-ad.jpg", description: "Male professional, 30s" },
      { id: "v11", thumbnail: "/young-professional-ad.jpg", description: "Young professional, 20s" },
      { id: "v12", thumbnail: "/diverse-talent-ad.jpg", description: "Diverse ensemble" },
    ],
  },
]

export function GeneratePacks({ onComplete }: GeneratePacksProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (currentStepIndex >= GENERATION_STEPS.length) {
      setTimeout(() => onComplete(MOCK_CLUSTERS), 500)
      return
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStepIndex])
      setCurrentStepIndex((prev) => prev + 1)
    }, GENERATION_STEPS[currentStepIndex].duration)

    return () => clearTimeout(timer)
  }, [currentStepIndex, onComplete])

  const progress = Math.round((completedSteps.length / GENERATION_STEPS.length) * 100)

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-lg w-full px-6">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Generating Structured Packs</h2>
          <p className="text-muted-foreground">Creating hypothesis-driven clusters, not random variations.</p>
        </div>

        <div className="space-y-3 mb-8">
          {GENERATION_STEPS.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                completedSteps.includes(index) ? "bg-accent/10" : index === currentStepIndex ? "bg-card" : "opacity-40"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  completedSteps.includes(index)
                    ? "bg-accent"
                    : index === currentStepIndex
                      ? "bg-secondary"
                      : "bg-muted"
                }`}
              >
                {completedSteps.includes(index) ? (
                  <CheckCircle2 className="w-4 h-4 text-accent-foreground" />
                ) : index === currentStepIndex ? (
                  <Layers className="w-3 h-3 text-foreground animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                )}
              </div>
              <span
                className={`text-sm ${
                  completedSteps.includes(index) || index === currentStepIndex
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-muted-foreground text-center mt-3">{progress}%</p>
      </div>
    </div>
  )
}
