"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, AlertTriangle, Check, X, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CreativeIntent } from "@/app/page"

interface RealityCheckProps {
  intent: CreativeIntent
  axes: VariationAxis[]
  onApprove: () => void
  onReject: () => void
  onBack: () => void
}

export interface VariationAxis {
  dimension: string
  label: string
  range: number
  hypothesis: string
  examples: string[]
}

interface DraftPreview {
  axis: string
  label: string
  hypothesis: string
  original: string
  drafts: {
    id: string
    change: string
    preview: string
    confidence: "high" | "medium" | "low"
  }[]
  riskLevel: "low" | "medium" | "high"
  riskNote: string | null
}

// Simulated draft generation - in production this would be real AI output
const generateDraftPreviews = (intent: CreativeIntent, axes: VariationAxis[]): DraftPreview[] => {
  const previews: DraftPreview[] = []

  const axisData: Record<
    string,
    { original: string; drafts: DraftPreview["drafts"]; riskLevel: "low" | "medium" | "high"; riskNote: string | null }
  > = {
    hook: {
      original: "Problem-agitate opening",
      drafts: [
        {
          id: "h1",
          change: "Question opener",
          preview: '"Ever feel like your mornings are chaos?"',
          confidence: "high",
        },
        {
          id: "h2",
          change: "Bold statement",
          preview: '"Most people waste 2 hours every morning."',
          confidence: "high",
        },
        { id: "h3", change: "Pattern interrupt", preview: "[Quick zoom on coffee spill]", confidence: "medium" },
      ],
      riskLevel: "low",
      riskNote: null,
    },
    actor: {
      original: "Male professional, 30s",
      drafts: [
        {
          id: "a1",
          change: "Female professional, 30s",
          preview: "Corporate attire, confident delivery",
          confidence: "high",
        },
        { id: "a2", change: "Young creative, 20s", preview: "Casual style, energetic tone", confidence: "medium" },
      ],
      riskLevel: "medium",
      riskNote: "Actor consistency may degrade across variations",
    },
    environment: {
      original: "Home office",
      drafts: [
        { id: "e1", change: "Coffee shop", preview: "Busy background, ambient noise", confidence: "high" },
        { id: "e2", change: "Morning commute", preview: "Train/subway, earbuds in", confidence: "medium" },
        { id: "e3", change: "Kitchen", preview: "Morning routine, natural light", confidence: "high" },
      ],
      riskLevel: "low",
      riskNote: null,
    },
    pacing: {
      original: "Moderate (2.5s cuts)",
      drafts: [
        { id: "p1", change: "Fast (1.5s cuts)", preview: "Quick transitions, high energy", confidence: "high" },
        { id: "p2", change: "Variable rhythm", preview: "Slow open → fast middle → slow close", confidence: "low" },
      ],
      riskLevel: "high",
      riskNote: "High variance expected with variable rhythm",
    },
  }

  axes.forEach((axis) => {
    const data = axisData[axis.dimension]
    if (data) {
      previews.push({
        axis: axis.dimension,
        label: axis.label,
        hypothesis: axis.hypothesis,
        original: data.original,
        drafts: data.drafts.slice(0, axis.range),
        riskLevel: data.riskLevel,
        riskNote: data.riskNote,
      })
    }
  })

  return previews
}

export function RealityCheck({ intent, axes, onApprove, onReject, onBack }: RealityCheckProps) {
  const [previews, setPreviews] = useState<DraftPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAxes, setExpandedAxes] = useState<Set<string>>(new Set())
  const [axisApprovals, setAxisApprovals] = useState<Record<string, boolean | null>>({})

  useEffect(() => {
    // Simulate draft generation delay
    const timer = setTimeout(() => {
      const generated = generateDraftPreviews(intent, axes)
      setPreviews(generated)
      setLoading(false)
      // Auto-expand all axes initially
      setExpandedAxes(new Set(generated.map((p) => p.axis)))
      // Initialize all approvals as null
      const initialApprovals: Record<string, boolean | null> = {}
      generated.forEach((p) => {
        initialApprovals[p.axis] = null
      })
      setAxisApprovals(initialApprovals)
    }, 1500)
    return () => clearTimeout(timer)
  }, [intent, axes])

  const toggleAxis = (axis: string) => {
    setExpandedAxes((prev) => {
      const next = new Set(prev)
      if (next.has(axis)) next.delete(axis)
      else next.add(axis)
      return next
    })
  }

  const setAxisApproval = (axis: string, approved: boolean) => {
    setAxisApprovals((prev) => ({ ...prev, [axis]: approved }))
  }

  const hasHighRisk = previews.some((p) => p.riskLevel === "high")
  const hasMediumRisk = previews.some((p) => p.riskLevel === "medium")
  const allAxesDecided = Object.values(axisApprovals).every((v) => v !== null)
  const anyRejected = Object.values(axisApprovals).some((v) => v === false)
  const totalVariations = axes.reduce((acc, axis) => acc * (axis.range + 1), 1)

  const getConfidenceColor = (confidence: "high" | "medium" | "low") => {
    switch (confidence) {
      case "high":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "low":
        return "text-red-400"
    }
  }

  const getRiskBadge = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return null
      case "medium":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            Medium variance
          </span>
        )
      case "high":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">
            High variance
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Generating draft previews...</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Creating 2-3 examples per axis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        {/* Header */}
        <div className="mb-10">
          <p className="text-accent text-sm font-medium tracking-wide uppercase mb-3">Pre-Generation Check</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4 text-balance">
            Reality Check
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Review draft variations before committing to full generation. If you're unhappy later, you should have seen
            it coming here.
          </p>
        </div>

        {/* Risk Summary */}
        {(hasHighRisk || hasMediumRisk) && (
          <div
            className={cn(
              "p-4 rounded-lg border mb-8 flex items-start gap-3",
              hasHighRisk ? "bg-red-500/5 border-red-500/20" : "bg-yellow-500/5 border-yellow-500/20",
            )}
          >
            <AlertTriangle
              className={cn("w-5 h-5 shrink-0 mt-0.5", hasHighRisk ? "text-red-400" : "text-yellow-400")}
            />
            <div>
              <p className={cn("font-medium", hasHighRisk ? "text-red-400" : "text-yellow-400")}>
                {hasHighRisk ? "High variance detected" : "Medium variance detected"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {hasHighRisk
                  ? "Some axes have unpredictable outputs. Review drafts carefully before approving."
                  : "Some variations may require additional review. Outputs should be mostly consistent."}
              </p>
            </div>
          </div>
        )}

        {/* Draft Previews by Axis */}
        <div className="space-y-4 mb-8">
          {previews.map((preview) => (
            <div key={preview.axis} className="rounded-lg bg-card border border-border overflow-hidden">
              {/* Axis Header */}
              <button
                onClick={() => toggleAxis(preview.axis)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-card-foreground text-left">{preview.label}</h3>
                      {getRiskBadge(preview.riskLevel)}
                    </div>
                    <p className="text-sm text-muted-foreground text-left mt-0.5">{preview.hypothesis}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {axisApprovals[preview.axis] !== null && (
                    <span className={cn("text-sm", axisApprovals[preview.axis] ? "text-green-400" : "text-red-400")}>
                      {axisApprovals[preview.axis] ? "Approved" : "Needs revision"}
                    </span>
                  )}
                  {expandedAxes.has(preview.axis) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedAxes.has(preview.axis) && (
                <div className="px-6 pb-6 border-t border-border">
                  {/* Intent Diff */}
                  <div className="py-4 border-b border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">What changes</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground line-through">{preview.original}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {preview.drafts.map((d) => d.change).join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Draft Examples */}
                  <div className="py-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Draft outputs</p>
                    <div className="grid gap-3">
                      {preview.drafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border"
                        >
                          <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                            <span className="text-xs text-muted-foreground">Preview</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-card-foreground">{draft.change}</span>
                              <span className={cn("text-xs", getConfidenceColor(draft.confidence))}>
                                {draft.confidence} confidence
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{draft.preview}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Note */}
                  {preview.riskNote && (
                    <div className="py-3 px-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 mb-4">
                      <p className="text-sm text-yellow-400">{preview.riskNote}</p>
                    </div>
                  )}

                  {/* Axis Approval */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      size="sm"
                      variant={axisApprovals[preview.axis] === true ? "default" : "outline"}
                      onClick={() => setAxisApproval(preview.axis, true)}
                      className={cn(
                        "gap-2",
                        axisApprovals[preview.axis] === true && "bg-green-600 hover:bg-green-700 border-green-600",
                      )}
                    >
                      <Check className="w-4 h-4" />
                      Looks good
                    </Button>
                    <Button
                      size="sm"
                      variant={axisApprovals[preview.axis] === false ? "default" : "outline"}
                      onClick={() => setAxisApproval(preview.axis, false)}
                      className={cn(
                        "gap-2",
                        axisApprovals[preview.axis] === false && "bg-red-600 hover:bg-red-700 border-red-600",
                      )}
                    >
                      <X className="w-4 h-4" />
                      Needs work
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-6 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Axes reviewed</span>
            <span className="font-mono text-foreground">
              {Object.values(axisApprovals).filter((v) => v !== null).length} / {previews.length}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Approved directions</span>
            <span className="font-mono text-foreground">
              {Object.values(axisApprovals).filter((v) => v === true).length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Will generate</span>
            <span className="font-mono text-foreground">{totalVariations} variations</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Adjust Variation Space
          </Button>

          <div className="flex items-center gap-3">
            {anyRejected && (
              <Button variant="outline" onClick={onReject} className="gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                Tighten & Retry
              </Button>
            )}
            <Button onClick={onApprove} disabled={!allAxesDecided || anyRejected} className="gap-2">
              {!allAxesDecided
                ? "Review all axes first"
                : anyRejected
                  ? "Fix rejected axes"
                  : `Generate ${totalVariations} Variations`}
              {allAxesDecided && !anyRejected && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
