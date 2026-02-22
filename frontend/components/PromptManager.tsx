"use client"

import { useState, useEffect } from "react"
import { X, Plus, Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Template {
  id: string
  name: string
  description: string
  type: string
  fields: Array<{ name: string; type: string; placeholder: string }>
}

interface PromptManagerProps {
  sessionId: string
  isOpen: boolean
  onClose: () => void
  onPromptCreated: () => void
}

export default function PromptManager({
  sessionId,
  isOpen,
  onClose,
  onPromptCreated,
}: PromptManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Load templates on mount
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/prompts/templates`)
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (err) {
      console.error("Error loading templates:", err)
      setError("Could not load prompt templates")
    }
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setFormData({})
    setError("")
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleCreatePrompt = async () => {
    if (!selectedTemplate) return

    // Validate fields
    const missingFields = selectedTemplate.fields.filter((f) => !formData[f.name])
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.map((f) => f.name).join(", ")}`)
      return
    }

    setLoading(true)
    setError("")

    try {
      // Prepare metadata based on prompt type
      let metadata: Record<string, any> = {}

      if (selectedTemplate.type === "forbidden_words") {
        metadata.words = formData.words
          .split(",")
          .map((w) => w.trim())
          .filter((w) => w)
      } else if (selectedTemplate.type === "time_target") {
        // Parse duration and calculate deadline
        const duration = formData.duration.toLowerCase()
        metadata.time_input = formData.duration
        // Store for UI display
        metadata.deadline = `+${formData.duration}`
      } else if (selectedTemplate.type === "schedule") {
        metadata.schedule_time = formData.schedule
      }

      const promptName = `${selectedTemplate.name}${
        formData.topic || formData.role || formData.task ? `: ${formData.topic || formData.role || formData.task}` : ""
      }`

      const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt_type: selectedTemplate.type,
          name: promptName,
          content: formData[selectedTemplate.fields[0]?.name || "task"] || "",
          metadata,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to create prompt")
      }

      onPromptCreated()
      onClose()
    } catch (err) {
      console.error("Error creating prompt:", err)
      setError("Failed to create prompt. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-semibold text-white/85">
              {selectedTemplate ? `Create: ${selectedTemplate.name}` : "Choose Prompt Type"}
            </h2>
            <p className="text-xs text-white/40 mt-1">
              {selectedTemplate
                ? selectedTemplate.description
                : "Select a prompt type to customize AI behavior"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedTemplate ? (
            // Template selection grid
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-left transition-all group"
                >
                  <h3 className="font-medium text-white/85 group-hover:text-white text-sm">{template.name}</h3>
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">{template.description}</p>
                </button>
              ))}
            </div>
          ) : (
            // Form for selected template
            <div className="space-y-4 p-6">
              {selectedTemplate.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-white/60 mb-2 capitalize">
                    {field.name.replace(/_/g, " ")}
                  </label>
                  {field.type === "text" ? (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 focus:border-white/20 focus:bg-white/8 outline-none transition-all"
                    />
                  ) : field.type === "textarea" ? (
                    <textarea
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 focus:border-white/20 focus:bg-white/8 outline-none resize-none transition-all"
                    />
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 focus:border-white/20 focus:bg-white/8 outline-none transition-all"
                    />
                  )}
                </div>
              ))}

              {/* Preview */}
              {selectedTemplate.type === "forbidden_words" && formData.words && (
                <div className="mt-4 p-3 rounded-lg bg-pink-500/10 border border-pink-400/20">
                  <p className="text-xs text-pink-400 font-medium">Forbidden words:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.words
                      .split(",")
                      .map((w) => w.trim())
                      .filter((w) => w)
                      .map((word, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs">
                          {word}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-400/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/5">
          {selectedTemplate && (
            <button
              onClick={() => {
                setSelectedTemplate(null)
                setFormData({})
                setError("")
              }}
              className="px-4 py-2 text-sm text-white/60 hover:text-white/85 transition-all"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/85 text-sm transition-all"
            >
              Cancel
            </button>
            {selectedTemplate && (
              <button
                onClick={handleCreatePrompt}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 text-blue-400 text-sm font-medium transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Prompt
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
