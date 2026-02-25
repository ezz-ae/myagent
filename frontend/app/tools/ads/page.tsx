"use client"

import { useState } from "react"
import { SelectWinner } from "@/components/tools/ads/select-winner"
import { ExtractIntent } from "@/components/tools/ads/extract-intent"
import { DefineVariationSpace } from "@/components/tools/ads/define-variation-space"
import { RealityCheck, type VariationAxis } from "@/components/tools/ads/reality-check"
import { GeneratePacks } from "@/components/tools/ads/generate-packs"
import { ReviewApprove } from "@/components/tools/ads/review-approve"
import { ExportComplete } from "@/components/tools/ads/export-complete"
import { FlowHeader } from "@/components/tools/ads/flow-header"

export type FlowStep =
  | "select-winner"
  | "extract-intent"
  | "define-variation-space"
  | "reality-check"
  | "generate-packs"
  | "review-approve"
  | "export-complete"

export interface CreativeIntent {
  nonNegotiables: {
    coreMessage: string
    promise: string
    proof: string
  }
  flexibleDimensions: {
    hook: { value: string; locked: boolean }
    actor: { value: string; locked: boolean }
    environment: { value: string; locked: boolean }
    format: { value: string; locked: boolean }
    pacing: { value: string; locked: boolean }
    script: { value: string; locked: boolean }
    voiceover: { value: string; locked: boolean }
    onScreenText: { value: string; locked: boolean }
  }
}

export interface VariationCluster {
  id: string
  hypothesis: string
  dimension: string
  variationCount: number
  approved: boolean | null
  variations: {
    id: string
    thumbnail: string
    description: string
  }[]
}

export default function AdsCreationTool() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("select-winner")
  const [selectedAd, setSelectedAd] = useState<string | null>(null)
  const [creativeIntent, setCreativeIntent] = useState<CreativeIntent | null>(null)
  const [variationAxes, setVariationAxes] = useState<VariationAxis[]>([])
  const [clusters, setClusters] = useState<VariationCluster[]>([])
  const [approvedCount, setApprovedCount] = useState(0)

  const handleAdSelected = (adId: string) => {
    setSelectedAd(adId)
    setCurrentStep("extract-intent")
  }

  const handleIntentExtracted = (intent: CreativeIntent) => {
    setCreativeIntent(intent)
    setCurrentStep("define-variation-space")
  }

  const handleVariationSpaceDefined = (axes: VariationAxis[]) => {
    setVariationAxes(axes)
    setCurrentStep("reality-check")
  }

  const handleRealityCheckComplete = (approvedAxes: VariationAxis[]) => {
    setVariationAxes(approvedAxes)
    setCurrentStep("generate-packs")
  }

  const handlePacksGenerated = (generatedClusters: VariationCluster[]) => {
    setClusters(generatedClusters)
    setCurrentStep("review-approve")
  }

  const handleReviewComplete = (approved: VariationCluster[], count: number) => {
    setClusters(approved)
    setApprovedCount(count)
    setCurrentStep("export-complete")
  }

  const handleRestart = () => {
    setCurrentStep("select-winner")
    setSelectedAd(null)
    setCreativeIntent(null)
    setVariationAxes([])
    setClusters([])
    setApprovedCount(0)
  }

  return (
    <div className="min-h-screen bg-[oklch(0.13_0_0)] text-white">
      <FlowHeader currentStep={currentStep} onStartOver={handleRestart} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {currentStep === "select-winner" && (
          <SelectWinner onAdSelected={handleAdSelected} />
        )}
        {currentStep === "extract-intent" && selectedAd && (
          <ExtractIntent adId={selectedAd} onIntentExtracted={handleIntentExtracted} />
        )}
        {currentStep === "define-variation-space" && creativeIntent && (
          <DefineVariationSpace
            creativeIntent={creativeIntent}
            onVariationSpaceDefined={handleVariationSpaceDefined}
          />
        )}
        {currentStep === "reality-check" && (
          <RealityCheck
            axes={variationAxes}
            onComplete={handleRealityCheckComplete}
          />
        )}
        {currentStep === "generate-packs" && creativeIntent && (
          <GeneratePacks
            creativeIntent={creativeIntent}
            axes={variationAxes}
            onPacksGenerated={handlePacksGenerated}
          />
        )}
        {currentStep === "review-approve" && (
          <ReviewApprove
            clusters={clusters}
            onReviewComplete={handleReviewComplete}
          />
        )}
        {currentStep === "export-complete" && (
          <ExportComplete
            approvedCount={approvedCount}
            clusters={clusters.filter((c) => c.approved === true)}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  )
}
