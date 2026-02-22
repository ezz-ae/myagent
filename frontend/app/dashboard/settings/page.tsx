"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { ChevronLeft, Settings, Save, AlertCircle } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface DashboardConfig {
  widgets: {
    recent_sessions: boolean
    active_prompts: boolean
    activity_feed: boolean
    recordings: boolean
    task_list: boolean
  }
  task_list: string[]
  notes: string
  exclude_first_task: boolean
}

export default function SettingsPage() {
  const [config, setConfig] = useState<DashboardConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTask, setNewTask] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/v1/dashboard`)
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (err) {
      console.error("Error loading config:", err)
      setError("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const res = await fetch(`${API_BASE}/v1/dashboard`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        setSuccess("Settings saved successfully")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to save settings")
      }
    } catch (err) {
      console.error("Error saving config:", err)
      setError("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleAddTask = () => {
    if (!newTask.trim() || !config) return
    setConfig((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        task_list: [...prev.task_list, newTask],
      }
    })
    setNewTask("")
  }

  const handleRemoveTask = (idx: number) => {
    setConfig((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        task_list: prev.task_list.filter((_, i) => i !== idx),
      }
    })
  }

  const handleToggleWidget = (widget: keyof DashboardConfig["widgets"]) => {
    setConfig((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        widgets: {
          ...prev.widgets,
          [widget]: !prev.widgets[widget],
        },
      }
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-white/25">Loading settings…</div>
      </DashboardLayout>
    )
  }

  if (!config) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-white/25">Failed to load settings</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white/90">Dashboard Settings</h1>
            <p className="text-xs text-white/30 mt-0.5">Configure your dashboard and task list</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            ✓ {success}
          </div>
        )}

        {/* Widget Toggle Section */}
        <div className="rounded-xl border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white/85 flex items-center gap-2">
            <Settings className="w-4 h-4 text-white/40" />
            Dashboard Widgets
          </h2>

          <div className="space-y-3">
            {Object.entries(config.widgets).map(([widget, enabled]) => (
              <label
                key={widget}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/10 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleToggleWidget(widget as keyof DashboardConfig["widgets"])}
                  className="w-4 h-4 rounded border border-white/20 bg-white/5 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/85 capitalize">
                    {widget.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-white/30">
                    {widget === "recent_sessions" && "Show recent sessions"}
                    {widget === "active_prompts" && "Show active prompts"}
                    {widget === "activity_feed" && "Show activity feed"}
                    {widget === "recordings" && "Show voice recordings"}
                    {widget === "task_list" && "Show model task list"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Task List Section */}
        <div className="rounded-xl border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white/85">Model Task List</h2>

          {/* Tasks */}
          {config.task_list.length > 0 && (
            <div className="space-y-2 mb-4">
              {config.task_list.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]"
                >
                  <div className="flex-1">
                    <p className="text-sm text-white/85">{task}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveTask(idx)}
                    className="px-2 py-1 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Task */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask()
              }}
              placeholder="Add new task…"
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 outline-none focus:border-white/20 text-sm"
            />
            <button
              onClick={handleAddTask}
              className="px-4 py-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 font-medium transition-all text-sm"
            >
              Add
            </button>
          </div>

          {/* First Task Exclusion */}
          <label className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/10 cursor-pointer transition-all mt-4">
            <input
              type="checkbox"
              checked={config.exclude_first_task}
              onChange={(e) =>
                setConfig((prev) => {
                  if (!prev) return prev
                  return { ...prev, exclude_first_task: e.target.checked }
                })
              }
              className="w-4 h-4 rounded border border-white/20 bg-white/5 cursor-pointer"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-white/85">Exclude first task online/offline</p>
              <p className="text-xs text-white/30">
                When enabled, the first task is hidden from dashboard but still executes
              </p>
            </div>
          </label>
        </div>

        {/* Notes Section */}
        <div className="rounded-xl border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white/85">Dashboard Notes</h2>
          <p className="text-xs text-white/40">
            Write notes or instructions for yourself and the model
          </p>
          <textarea
            value={config.notes}
            onChange={(e) =>
              setConfig((prev) => {
                if (!prev) return prev
                return { ...prev, notes: e.target.value }
              })
            }
            rows={5}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/85 placeholder:text-white/25 outline-none focus:border-white/20 resize-none text-sm"
            placeholder="Write your notes here…"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 text-blue-400 font-medium transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
