"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Database } from "lucide-react"
import { UploadDropzone } from "@/components/tools/scientist/upload-dropzone"
import { getDatasetFromLocalStorage, clearDatasetFromLocalStorage, saveDatasetToLocalStorage } from "@/lib/tools/scientist/local-storage"

// Titanic info inline (avoid import from original path)
const TITANIC_INFO = { name: "Titanic", rows: 200 }

export default function ScientistUploadPage() {
  const router = useRouter()
  const [savedDatasetId, setSavedDatasetId] = useState<string | null>(null)
  const [isLoadingSample, setIsLoadingSample] = useState(false)

  useEffect(() => {
    const saved = getDatasetFromLocalStorage()
    if (saved?.datasetId) setSavedDatasetId(saved.datasetId)
  }, [])

  const handleContinue = () => {
    if (savedDatasetId) router.push(`/tools/scientist/explore?datasetId=${savedDatasetId}`)
  }

  const handleClearSaved = () => {
    clearDatasetFromLocalStorage()
    setSavedDatasetId(null)
  }

  const handleLoadSample = async () => {
    setIsLoadingSample(true)
    try {
      const res = await fetch("/tools/scientist/api/dataset/sample", { method: "POST" })
      if (!res.ok) throw new Error("Failed to load sample")
      const data = await res.json()
      if (data.storedDataset) saveDatasetToLocalStorage(data.storedDataset)
      router.push(`/tools/scientist/explore?datasetId=${data.datasetId}`)
    } catch (error) {
      console.error("Failed to load sample dataset:", error)
    } finally {
      setIsLoadingSample(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-400/5 pointer-events-none" />

      <div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="absolute top-8 left-6">
          <Link
            href="/app"
            className="text-xs uppercase tracking-[0.25em] text-white/40 hover:text-white/70 transition-colors"
          >
            ← LocalAgent
          </Link>
        </div>
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-sm text-blue-400 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              </span>
              AI-Powered Analytics
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">AI Data Scientist</h1>
            <p className="text-white/50 text-lg">Upload a CSV file to get instant insights and guided exploration</p>
          </div>

          {savedDatasetId && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-500/20 p-2">
                    <Database className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Previous dataset available</p>
                    <p className="text-xs text-white/40">Continue where you left off</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleClearSaved} className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg transition-colors">Clear</button>
                  <button onClick={handleContinue} className="flex items-center gap-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors">
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <UploadDropzone />

          <div className="text-center">
            <p className="text-sm text-white/40 mb-3">Or try with a sample dataset</p>
            <button
              onClick={handleLoadSample}
              disabled={isLoadingSample}
              className="inline-flex items-center gap-2 border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 text-white/60 hover:text-white text-sm px-4 py-2 rounded-xl transition-all"
            >
              {isLoadingSample ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-blue-400" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 text-blue-400" />
                  Load {TITANIC_INFO.name} ({TITANIC_INFO.rows} rows)
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "📊", title: "Auto Overview", desc: "Instant charts for distributions and relationships" },
              { icon: "🔍", title: "Click to Explore", desc: "Enhance, filter, or generalize any chart" },
              { icon: "🤖", title: "AI Insights", desc: "AI-powered analysis and suggestions" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-medium text-white/80 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-white/35">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
