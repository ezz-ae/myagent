"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Check, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { VariationCluster } from "@/app/page"

interface ReviewApproveProps {
  clusters: VariationCluster[]
  setClusters: (clusters: VariationCluster[]) => void
  onComplete: (approvedCount: number) => void
  onBack: () => void
}

export function ReviewApprove({ clusters, setClusters, onComplete, onBack }: ReviewApproveProps) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(clusters[0]?.id || null)

  const handleApprove = (clusterId: string) => {
    setClusters(clusters.map((c) => (c.id === clusterId ? { ...c, approved: true } : c)))
  }

  const handleReject = (clusterId: string) => {
    setClusters(clusters.map((c) => (c.id === clusterId ? { ...c, approved: false } : c)))
  }

  const approvedClusters = clusters.filter((c) => c.approved === true)
  const pendingClusters = clusters.filter((c) => c.approved === null)
  const totalApproved = approvedClusters.reduce((acc, c) => acc + c.variationCount, 0)

  const canComplete = pendingClusters.length === 0 && approvedClusters.length > 0

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <p className="text-accent text-sm font-medium tracking-wide uppercase mb-3">Step 5</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4 text-balance">
            Review & Approve
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Approve or reject entire hypothesis clusters. No frame-by-frame review needed.
          </p>
        </div>

        <div className="space-y-4">
          {clusters.map((cluster) => (
            <div
              key={cluster.id}
              className={cn(
                "rounded-lg border transition-all duration-200",
                cluster.approved === true && "border-accent bg-accent/5",
                cluster.approved === false && "border-destructive/50 bg-destructive/5 opacity-60",
                cluster.approved === null && "border-border bg-card",
              )}
            >
              <button
                onClick={() => setExpandedCluster(expandedCluster === cluster.id ? null : cluster.id)}
                className="w-full p-6 flex items-center justify-between gap-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground uppercase tracking-wide">
                      {cluster.dimension}
                    </span>
                    <span className="text-sm text-muted-foreground">{cluster.variationCount} variations</span>
                    {cluster.approved !== null && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs",
                          cluster.approved ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive",
                        )}
                      >
                        {cluster.approved ? "Approved" : "Rejected"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-foreground">{cluster.hypothesis}</h3>
                </div>
                {expandedCluster === cluster.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </button>

              {expandedCluster === cluster.id && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {cluster.variations.map((variation) => (
                      <div key={variation.id} className="space-y-2">
                        <div className="aspect-video rounded-md overflow-hidden bg-secondary">
                          <img
                            src={variation.thumbnail || "/placeholder.svg"}
                            alt={variation.description}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{variation.description}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    + {cluster.variationCount - 3} more variations in this cluster
                  </p>

                  {cluster.approved === null && (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleApprove(cluster.id)}
                        className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <Check className="w-4 h-4" />
                        Approve Cluster
                      </Button>
                      <Button variant="outline" onClick={() => handleReject(cluster.id)} className="gap-2">
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {cluster.approved !== null && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setClusters(clusters.map((c) => (c.id === cluster.id ? { ...c, approved: null } : c)))
                      }
                      className="text-sm"
                    >
                      Reconsider
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Approved: </span>
              <span className="text-foreground font-medium">{totalApproved} variations</span>
              <span className="text-muted-foreground"> in </span>
              <span className="text-foreground font-medium">{approvedClusters.length} clusters</span>
            </div>
            <Button onClick={() => onComplete(totalApproved)} disabled={!canComplete} className="gap-2">
              Export Pack
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
