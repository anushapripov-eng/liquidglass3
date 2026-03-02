"use client"

import { useState, useRef } from "react"
import { useStore } from "@/lib/store"
import { GlassCard } from "@/components/glass-card"
import { cn } from "@/lib/utils"
import {
  Shield,
  Plus,
  X,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Trash2,
  Image as ImageIcon,
} from "lucide-react"

export function RulesSection() {
  const store = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState("")
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
    if (!text) return
    store.addRule({ text, imageUrl })
    setText("")
    setImageUrl(undefined)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Trading Rules</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 active:scale-95 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-4" variant="strong">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">New Rule</span>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Your trading rule..."
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
              disabled={!text}
              className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 active:scale-[0.98] disabled:opacity-40"
            >
              Add Rule
            </button>
          </div>
        </GlassCard>
      )}

      {store.rules.length === 0 ? (
        <GlassCard className="p-8 flex flex-col items-center text-center" variant="subtle">
          <Shield className="w-8 h-8 text-muted-foreground/40 mb-3" />
          <span className="text-sm text-muted-foreground">No rules defined yet</span>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-2">
          {store.rules.map((rule, idx) => (
            <GlassCard key={rule.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">{rule.text}</p>
                  {rule.imageUrl && (
                    <img src={rule.imageUrl} alt="Rule attachment" className="w-full h-24 object-cover rounded-xl mt-2" />
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === rule.id ? null : rule.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openMenu === rule.id && (
                    <div className="absolute right-0 top-6 glass-strong rounded-xl p-1 min-w-[140px] z-10">
                      {idx > 0 && (
                        <button
                          onClick={() => { store.moveRule(rule.id, "up"); setOpenMenu(null) }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/50 w-full"
                        >
                          <ArrowUp className="w-3 h-3" /> Move Up
                        </button>
                      )}
                      {idx < store.rules.length - 1 && (
                        <button
                          onClick={() => { store.moveRule(rule.id, "down"); setOpenMenu(null) }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/50 w-full"
                        >
                          <ArrowDown className="w-3 h-3" /> Move Down
                        </button>
                      )}
                      <button
                        onClick={() => { store.deleteRule(rule.id); setOpenMenu(null) }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 w-full"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
