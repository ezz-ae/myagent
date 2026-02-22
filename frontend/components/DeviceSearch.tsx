"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2, FileText, Folder, HardDrive } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface SearchResult {
  id: string
  name: string
  path: string
  type: "file" | "folder" | "device"
  size?: number
  modified?: string
}

interface DeviceSearchProps {
  onSelect?: (result: SearchResult) => void
  placeholder?: string
}

export default function DeviceSearch({ onSelect, placeholder = "Search device…" }: DeviceSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleSearch = async (q: string) => {
    setQuery(q)

    if (!q.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    try {
      setLoading(true)
      setShowResults(true)

      const res = await fetch(`${API_BASE}/v1/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
      }
    } catch (err) {
      console.error("Search error:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result)
    setQuery("")
    setShowResults(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }

    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showResults])

  const getIcon = (type: string) => {
    switch (type) {
      case "folder":
        return <Folder className="w-4 h-4 text-blue-400" />
      case "file":
        return <FileText className="w-4 h-4 text-white/40" />
      case "device":
        return <HardDrive className="w-4 h-4 text-orange-400" />
      default:
        return <FileText className="w-4 h-4 text-white/40" />
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 text-sm outline-none focus:border-white/20 focus:bg-white/8 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setShowResults(false)
            }}
            className="absolute right-2 p-1 text-white/30 hover:text-white/70 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-white/30">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Searching…</span>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-white/25 text-sm">
              {query ? "No results found" : "Start typing to search…"}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-all group flex items-start gap-3"
                >
                  <div className="shrink-0 mt-0.5">{getIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/85 group-hover:text-white truncate">
                      {result.name}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5 truncate">{result.path}</p>
                    {result.size && (
                      <p className="text-[10px] text-white/20 mt-1">
                        {(result.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
