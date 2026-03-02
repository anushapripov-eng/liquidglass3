"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { X, DollarSign, Check } from "lucide-react"

interface BalanceEditorProps {
  open: boolean
  onClose: () => void
}

export function BalanceEditor({ open, onClose }: BalanceEditorProps) {
  const store = useStore()
  const [balance, setBalance] = useState(store.balance.toString())
  const [initialBalance, setInitialBalance] = useState(store.initialBalance.toString())

  const handleSave = () => {
    const b = parseFloat(balance)
    const ib = parseFloat(initialBalance)
    if (!isNaN(b)) store.setBalance(b)
    if (!isNaN(ib)) store.setInitialBalance(ib)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
      <div
        className="relative p-6 w-full max-w-sm glass-strong rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Edit Balance</h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Starting Balance
              </label>
              <input
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                type="number"
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                placeholder="10000"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Current Balance
              </label>
              <input
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                type="number"
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                placeholder="10000"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 active:scale-[0.98] hover:opacity-90"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
