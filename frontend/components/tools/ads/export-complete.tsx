"use client"

import { CheckCircle2, Download, RotateCcw, Layers, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { VariationCluster } from "@/app/page"

interface ExportCompleteProps {
  approvedCount: number
  clusters: VariationCluster[]
  onStartOver: () => void
}

export function ExportComplete({ approvedCount, clusters, onStartOver }: ExportCompleteProps) {
  const approvedClusters = clusters.filter((c) => c.approved === true)

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-2xl w-full px-6 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4">Pack Ready</h1>
          <p className="text-lg text-muted-foreground">Your creative variations are ready for export and deployment.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-lg bg-card border border-border">
            <Layers className="w-6 h-6 text-accent mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">{approvedCount}</p>
            <p className="text-sm text-muted-foreground">Approved Variations</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <TrendingUp className="w-6 h-6 text-accent mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">{approvedClusters.length}</p>
            <p className="text-sm text-muted-foreground">Hypothesis Clusters</p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-card border border-border mb-8">
          <h3 className="font-medium text-foreground mb-4">Approved Hypotheses</h3>
          <div className="space-y-3">
            {approvedClusters.map((cluster) => (
              <div key={cluster.id} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <p className="text-sm text-muted-foreground">{cluster.hypothesis}</p>
                <span className="text-xs text-accent ml-auto">{cluster.variationCount} ads</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-secondary/50 border border-border mb-8">
          <p className="text-sm text-muted-foreground text-center">
            Your approval patterns have been recorded to improve future pack suggestions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" />
            Export to Meta
          </Button>
          <Button size="lg" variant="outline" onClick={onStartOver} className="gap-2 w-full sm:w-auto bg-transparent">
            <RotateCcw className="w-4 h-4" />
            Scale Another Winner
          </Button>
        </div>
      </div>
    </div>
  )
}
