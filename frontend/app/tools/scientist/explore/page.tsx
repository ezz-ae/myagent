"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { DatasetSummary } from "@/components/tools/scientist/dataset-summary"
import { ChartGrid } from "@/components/tools/scientist/chart-grid"
import { ChartExpandedModal } from "@/components/tools/scientist/chart-expanded-modal"
import { getDatasetFromLocalStorage } from "@/lib/tools/scientist/local-storage"
import type { DatasetProfile, VisSpec } from "@/lib/tools/scientist/types"

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const datasetId = searchParams.get("datasetId")

  const [profile, setProfile] = useState<DatasetProfile | null>(null)
  const [overviewCharts, setOverviewCharts] = useState<VisSpec[]>([])
  const [expandedChart, setExpandedChart] = useState<VisSpec | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!datasetId) { router.push("/tools/scientist"); return }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        let profileRes = await fetch(`/tools/scientist/api/dataset/profile?datasetId=${datasetId}`)
        if (profileRes.status === 404) {
          const savedDataset = getDatasetFromLocalStorage()
          if (savedDataset && savedDataset.datasetId === datasetId) {
            const restoreRes = await fetch("/tools/scientist/api/dataset/restore", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(savedDataset),
            })
            if (restoreRes.ok) profileRes = await fetch(`/tools/scientist/api/dataset/profile?datasetId=${datasetId}`)
          }
        }
        if (!profileRes.ok) throw new Error(profileRes.status === 404 ? "Dataset not found. Please upload your file again." : "Failed to load dataset")
        setProfile(await profileRes.json())

        const overviewRes = await fetch("/tools/scientist/api/recommend/overview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datasetId }),
        })
        if (!overviewRes.ok) throw new Error("Failed to generate overview")
        const overviewData = await overviewRes.json()
        setOverviewCharts(overviewData.charts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [datasetId, router])

  const handleChartClick = useCallback((chart: VisSpec) => setExpandedChart(chart), [])
  const handleCloseModal = useCallback(() => setExpandedChart(null), [])
  const handleNavigateToChart = useCallback((chart: VisSpec) => {
    setOverviewCharts((prev) => prev.some((c) => c.id === chart.id) ? prev : [chart, ...prev])
  }, [])

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-400" />
        <p className="text-white/40">Loading dataset...</p>
      </div>
    </div>
  )

  if (error || !profile) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
        <p className="text-white/40">{error || "Dataset not found"}</p>
        <Link href="/tools/scientist" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Upload a new file
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/[0.07] bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link href="/tools/scientist" className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
              <ArrowLeft className="h-4 w-4" /> New Upload
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-400">{profile.rowCount.toLocaleString()}</span>
              <span className="text-sm text-white/30">rows</span>
            </div>
          </div>
          <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-full">{profile.columns.length} columns</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="hidden lg:block">
            <DatasetSummary profile={profile} />
          </aside>
          <main className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold">Overview</h2>
                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">{overviewCharts.length} charts</span>
              </div>
              <p className="text-sm text-white/40 mb-6">Click any chart to explore deeper with AI-powered insights</p>
              <ChartGrid charts={overviewCharts} selectedChartId={null} onSelectChart={handleChartClick} emptyMessage="No overview charts generated" />
            </div>
          </main>
        </div>
      </div>

      {expandedChart && profile && datasetId && (
        <ChartExpandedModal
          chart={expandedChart}
          profile={profile}
          datasetId={datasetId}
          onClose={handleCloseModal}
          onNavigateToChart={handleNavigateToChart}
        />
      )}
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-400" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  )
}
