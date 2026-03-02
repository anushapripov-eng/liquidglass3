"use client"

import { useState, useRef } from "react"
import { useStore } from "@/lib/store"
import type { ImportantPoint } from "@/lib/store"
import { GlassCard } from "@/components/glass-card"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Lightbulb,
  Plus,
  X,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Trash2,
  Image as ImageIcon,
  Pin,
} from "lucide-react"

type Tab = "mistakes" | "important"

export function MistakesSection() {
  const [activeTab, setActiveTab] = useState<Tab>("mistakes")

  return (
    <div className="flex flex-col gap-4">
      {/* Tab switcher */}
      <GlassCard className="p-1.5">
        <div className="flex gap-1">
          {(["mistakes", "important"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "mistakes" ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5" />
              )}
              {tab === "mistakes" ? "Mistakes" : "Important Points"}
            </button>
          ))}
        </div>
      </GlassCard>

      {activeTab === "mistakes" ? <MistakesTab /> : <ImportantPointsTab />}
    </div>
  )
}

function MistakesTab() {
  const store = useStore()
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [tag, setTag] = useState<"technical" | "broke-rules" | "other">("technical")

  const handleAdd = () => {
    if (!description) return
    store.addMistake({ date, description, tag })
    setDescription("")
    setShowForm(false)
  }

  const sortedMistakes = [...store.mistakes].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Your Mistakes</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium transition-all duration-300 active:scale-95"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-4" variant="strong">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">New Mistake</span>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What went wrong?"
              className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 resize-none"
            />
            <div className="flex gap-2">
              {(["technical", "broke-rules", "other"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-300",
                    tag === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {t === "broke-rules" ? "Broke Rules" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              disabled={!description}
              className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 active:scale-[0.98] disabled:opacity-40"
            >
              Add Mistake
            </button>
          </div>
        </GlassCard>
      )}

      {sortedMistakes.length === 0 ? (
        <GlassCard className="p-8 flex flex-col items-center text-center" variant="subtle">
          <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mb-3" />
          <span className="text-sm text-muted-foreground">No mistakes logged</span>
        </GlassCard>
      ) : (
        sortedMistakes.map((m) => (
          <GlassCard key={m.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-medium",
                    m.tag === "technical" && "bg-chart-1/10 text-chart-1",
                    m.tag === "broke-rules" && "bg-destructive/10 text-destructive",
                    m.tag === "other" && "bg-muted text-muted-foreground"
                  )}>
                    {m.tag === "broke-rules" ? "Broke Rules" : m.tag.charAt(0).toUpperCase() + m.tag.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{m.description}</p>
              </div>
              <button
                onClick={() => store.deleteMistake(m.id)}
                className="text-muted-foreground/60 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  )
}

function ImportantPointsTab() {
  const store = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showForm, setShowForm] = useState(false)
  const [note, setNote] = useState("")
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImageUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    if (!note) return
    store.addImportantPoint({ note, pinned: false, imageUrl })
    setNote("")
    setImageUrl(undefined)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Important Points</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium transition-all duration-300 active:scale-95"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-4" variant="strong">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">New Point</span>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Important insight or observation..."
              className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 resize-none"
            />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <ImageIcon className="w-4 h-4" />
              {imageUrl ? "Change Image" : "Attach Image"}
            </button>
            {imageUrl && (
              <img src={imageUrl} alt="Attached" className="w-full h-24 object-cover rounded-xl" />
            )}
            <button
              onClick={handleAdd}
              disabled={!note}
              className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 active:scale-[0.98] disabled:opacity-40"
            >
              Add Point
            </button>
          </div>
        </GlassCard>
      )}

      {store.importantPoints.length === 0 ? (
        <GlassCard className="p-8 flex flex-col items-center text-center" variant="subtle">
          <Lightbulb className="w-8 h-8 text-muted-foreground/40 mb-3" />
          <span className="text-sm text-muted-foreground">No important points yet</span>
        </GlassCard>
      ) : (
        store.importantPoints.map((p, idx) => (
          <GlassCard key={p.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {p.pinned && (
                  <Pin className="w-3 h-3 text-primary mb-1" />
                )}
                <p className="text-sm text-foreground">{p.note}</p>
                {p.imageUrl && (
                  <img src={p.imageUrl} alt="Attached" className="w-full h-24 object-cover rounded-xl mt-2" />
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {openMenu === p.id && (
                  <div className="absolute right-0 top-6 glass-strong rounded-xl p-1 min-w-[140px] z-10">
                    {idx > 0 && (
                      <button
                        onClick={() => { store.moveImportantPoint(p.id, "up"); setOpenMenu(null) }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/50 w-full"
                      >
                        <ArrowUp className="w-3 h-3" /> Move Up
                      </button>
                    )}
                    {idx < store.importantPoints.length - 1 && (
                      <button
                        onClick={() => { store.moveImportantPoint(p.id, "down"); setOpenMenu(null) }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/50 w-full"
                      >
                        <ArrowDown className="w-3 h-3" /> Move Down
                      </button>
                    )}
                    <button
                      onClick={() => { store.deleteImportantPoint(p.id); setOpenMenu(null) }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 w-full"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  )
}
