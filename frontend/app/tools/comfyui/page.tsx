"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { FileUploader } from "@/components/tools/comfyui/file-uploader"
import { WorkflowVisualizer } from "@/components/tools/comfyui/workflow-visualizer"
import { ModelList } from "@/components/tools/comfyui/model-list"
import { WorkflowStats } from "@/components/tools/comfyui/workflow-stats"
import { NodeList } from "@/components/tools/comfyui/node-list"
import { ImageMetadataExtractor } from "@/components/tools/comfyui/image-metadata-extractor"
import { parseComfyWorkflow } from "@/lib/tools/comfyui/workflow-parser"
import { exportWorkflowData } from "@/lib/tools/comfyui/export-utils"
import { Download, FileJson } from "lucide-react"

export default function ComfyUIAnalyzerPage() {
  const [workflow, setWorkflow] = useState<Record<string, unknown> | null>(null)
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null)
  const [activeTab, setActiveTab] = useState<"workflow" | "image">("workflow")
  const [innerTab, setInnerTab] = useState<"visualizer" | "models" | "nodes" | "stats">("visualizer")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchAndParseExample = async () => {
      try {
        const response = await fetch("/tools/comfyui/api/example-workflow")
        if (response.ok) {
          const data = await response.json()
          setWorkflow(data)
          const parsed = parseComfyWorkflow(data)
          setParsedData(parsed as Record<string, unknown>)
        }
      } catch (error) {
        console.error("Failed to load example workflow:", error)
      }
    }
    fetchAndParseExample()
  }, [])

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        setWorkflow(json)
        const parsed = parseComfyWorkflow(json)
        setParsedData(parsed as Record<string, unknown>)
      } catch {
        alert("Invalid workflow file. Please upload a valid ComfyUI JSON file.")
      }
    }
    reader.readAsText(file)
  }

  const handleExport = () => {
    if (!parsedData) return
    exportWorkflowData(parsedData as Parameters<typeof exportWorkflowData>[0], (workflow as { filename?: string })?.filename || "workflow-analysis")
  }

  const tabBtn = (id: typeof activeTab, label: string) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
        activeTab === id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
      }`}
    >
      {label}
    </button>
  )

  const innerTabBtn = (id: typeof innerTab, label: string) => (
    <button
      key={id}
      onClick={() => setInnerTab(id)}
      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
        innerTab === id ? "bg-purple-500/20 text-purple-300" : "text-white/40 hover:text-white/70"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0e] text-white">
      <header className="border-b border-white/[0.07] bg-[#0a0a0e]/90 py-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="text-xs uppercase tracking-[0.25em] text-white/40 hover:text-white/70 transition-colors"
            >
              ← LocalAgent
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileJson className="h-5 w-5 text-purple-400" />
              LocalAgent ComfyUI Analyzer
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:text-white transition-all"
            >
              Upload Workflow
            </button>
            <button
              onClick={handleExport}
              disabled={!parsedData}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export Analysis
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Top tabs */}
        <div className="flex gap-2 mb-6">
          {tabBtn("workflow", "Workflow Analysis")}
          {tabBtn("image", "Image Metadata")}
        </div>

        {activeTab === "workflow" && (
          <div>
            <FileUploader onFileUpload={handleFileUpload} ref={fileInputRef} />

            {parsedData ? (
              <div className="mt-6">
                <div className="flex gap-2 mb-5 flex-wrap">
                  {innerTabBtn("visualizer", "Workflow Visualizer")}
                  {innerTabBtn("models", "Required Models")}
                  {innerTabBtn("nodes", "Nodes")}
                  {innerTabBtn("stats", "Workflow Stats")}
                </div>

                {innerTab === "visualizer" && <WorkflowVisualizer data={parsedData as Parameters<typeof WorkflowVisualizer>[0]["data"]} />}
                {innerTab === "models" && <ModelList models={(parsedData as { models: Parameters<typeof ModelList>[0]["models"] }).models} />}
                {innerTab === "nodes" && <NodeList nodes={(parsedData as { nodeInfo: Parameters<typeof NodeList>[0]["nodes"] }).nodeInfo} />}
                {innerTab === "stats" && <WorkflowStats stats={(parsedData as { stats: Parameters<typeof WorkflowStats>[0]["stats"] }).stats} />}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 mt-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto" />
                  <p className="mt-4 text-white/40">Loading workflow data...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "image" && <ImageMetadataExtractor />}
      </main>

      <footer className="border-t border-white/[0.05] py-4 bg-[#0a0a0e]">
        <div className="container mx-auto px-4 text-center text-white/20 text-sm">
          ComfyUI Workflow Analyzer — Analyze and extract data from ComfyUI workflow files and images
        </div>
      </footer>
    </div>
  )
}
