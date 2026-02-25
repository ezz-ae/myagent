"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Upload, Play, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const SAMPLE_ADS = [
  {
    id: "ad-1",
    name: "Summer Sale Hero",
    thumbnail: "/ecommerce-summer-sale-ad.jpg",
    duration: "0:32",
    performance: "2.4x ROAS",
    impressions: "1.2M",
  },
  {
    id: "ad-2",
    name: "Product Demo UGC",
    thumbnail: "/ugc-product-demo-video-ad.jpg",
    duration: "0:45",
    performance: "3.1x ROAS",
    impressions: "890K",
  },
  {
    id: "ad-3",
    name: "Testimonial Story",
    thumbnail: "/testimonial-video-ad.jpg",
    duration: "0:28",
    performance: "2.8x ROAS",
    impressions: "1.5M",
  },
]

interface SelectWinnerProps {
  onSelect: (adId: string) => void
}

export function SelectWinner({ onSelect }: SelectWinnerProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <p className="text-accent text-sm font-medium tracking-wide uppercase mb-3">Step 1</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4 text-balance">
            Select Your Winner
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Choose a proven ad to scale. Winning ads are compressed creative intent — we&apos;ll extract what makes it
            work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {SAMPLE_ADS.map((ad) => (
            <button
              key={ad.id}
              onClick={() => setSelected(ad.id)}
              onMouseEnter={() => setHoveredId(ad.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group relative rounded-lg overflow-hidden border-2 transition-all duration-200 text-left",
                selected === ad.id
                  ? "border-accent ring-2 ring-accent/20"
                  : "border-border hover:border-muted-foreground/50",
              )}
            >
              <div className="aspect-video relative bg-secondary">
                <img src={ad.thumbnail || "/placeholder.svg"} alt={ad.name} className="w-full h-full object-cover" />
                <div
                  className={cn(
                    "absolute inset-0 bg-background/60 flex items-center justify-center transition-opacity",
                    hoveredId === ad.id || selected === ad.id ? "opacity-100" : "opacity-0",
                  )}
                >
                  {selected === ad.id ? (
                    <CheckCircle2 className="w-10 h-10 text-accent" />
                  ) : (
                    <Play className="w-10 h-10 text-foreground" />
                  )}
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-background/80 rounded text-xs text-foreground font-mono">
                  {ad.duration}
                </span>
              </div>
              <div className="p-4 bg-card">
                <h3 className="font-medium text-card-foreground mb-2">{ad.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="text-accent font-medium">{ad.performance}</span>
                  <span>{ad.impressions} imp</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 py-8 border-t border-border">
          <button className="flex items-center gap-3 px-6 py-4 rounded-lg border border-dashed border-border hover:border-muted-foreground/50 transition-colors group">
            <Upload className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              Or upload your own winning ad
            </span>
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{selected ? "1 ad selected" : "Select an ad to continue"}</p>
          <Button onClick={() => selected && onSelect(selected)} disabled={!selected} className="gap-2">
            Extract Intent
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
