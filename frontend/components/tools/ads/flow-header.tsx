"use client"

import { cn } from "@/lib/utils"
import type { FlowStep } from "@/app/tools/ads/page"
import { RotateCcw } from "lucide-react"

const STEPS: { key: FlowStep; label: string; number: number }[] = [
  { key: "select-winner", label: "Select", number: 1 },
  { key: "extract-intent", label: "Extract", number: 2 },
  { key: "define-variation-space", label: "Define", number: 3 },
  { key: "reality-check", label: "Check", number: 4 },
  { key: "generate-packs", label: "Generate", number: 5 },
  { key: "review-approve", label: "Review", number: 6 },
  { key: "export-complete", label: "Export", number: 7 },
]

interface FlowHeaderProps {
  currentStep: FlowStep
  onStartOver: () => void
}

export function FlowHeader({ currentStep, onStartOver }: FlowHeaderProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-[11px]">LA</span>
          </div>
          <span className="font-semibold text-foreground tracking-tight">LocalAgent Ads Lab</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md">
                <span
                  className={cn(
                    "w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium transition-colors",
                    index < currentIndex && "bg-accent text-accent-foreground",
                    index === currentIndex && "bg-primary text-primary-foreground",
                    index > currentIndex && "bg-secondary text-muted-foreground",
                  )}
                >
                  {step.number}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors",
                    index === currentIndex && "text-foreground font-medium",
                    index !== currentIndex && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn("w-8 h-px mx-1", index < currentIndex ? "bg-accent" : "bg-border")} />
              )}
            </div>
          ))}
        </nav>

        <button
          onClick={onStartOver}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Start Over</span>
        </button>
      </div>
    </header>
  )
}
