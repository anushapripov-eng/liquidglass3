"use client"

import { useState, useMemo } from "react"
import { useStore, getWeekStart, formatPercent } from "@/lib/store"
import { GlassCard } from "@/components/glass-card"
import { cn } from "@/lib/utils"
import { Target, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Save } from "lucide-react"

export function WeeklyView() {
  const store = useStore()
  const [weekOffset, setWeekOffset] = useState(0)

  const weekData = useMemo(() => {
    const now = new Date()
    const offsetDate = new Date(now)
    offsetDate.setDate(offsetDate.getDate() + weekOffset * 7)
    const weekStart = getWeekStart(offsetDate)

    // Get trades for this week
    const weekTrades = store.trades.filter(
      (t) => getWeekStart(new Date(t.date)) === weekStart
    )

    const totalPL = weekTrades.reduce((sum, t) => sum + t.result, 0)
    const goalHit = totalPL >= 2
    const hasProfit = weekTrades.some((t) => t.result > 0)

    // Get existing weekly note
    const existingNote = store.weeklyNotes.find((n) => n.weekStart === weekStart)

    // Build day list for the week
    const days = []
    const startDate = new Date(weekStart)
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split("T")[0]
      const trade = store.trades.find((t) => t.date === dateStr)
      const isSkip = store.skipDays.includes(dateStr)
      days.push({
        date: dateStr,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        trade,
        isSkip,
      })
    }

    const weekEnd = new Date(startDate)
    weekEnd.setDate(weekEnd.getDate() + 6)

    return {
      weekStart,
      weekLabel: `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      trades: weekTrades,
      totalPL,
      goalHit,
      hasProfit,
      existingNote,
      days,
    }
  }, [weekOffset, store.trades, store.skipDays, store.weeklyNotes])

  const [notes, setNotes] = useState(weekData.existingNote?.notes || "")

  const handleSaveNotes = () => {
    store.addWeeklyNote({
      weekStart: weekData.weekStart,
      notes,
      balanceChange: weekData.totalPL,
      goalHit: weekData.goalHit,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Week Navigation */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <span className="text-sm font-semibold text-foreground block">{weekData.weekLabel}</span>
            {weekOffset === 0 && (
              <span className="text-xs text-primary">Current Week</span>
            )}
          </div>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>

      {/* Weekly Summary */}
      <GlassCard className="p-5" variant="strong" hover3d>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Week Summary</span>
          </div>
          {weekData.goalHit ? (
            <div className="flex items-center gap-1 text-success text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Goal Hit
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
              <XCircle className="w-3.5 h-3.5" />
              In Progress
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-0.5">P/L</div>
            <div className={cn(
              "text-lg font-bold",
              weekData.totalPL >= 0 ? "text-success" : "text-destructive"
            )}>
              {formatPercent(weekData.totalPL)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Trades</div>
            <div className="text-lg font-bold text-foreground">{weekData.trades.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Goal</div>
            <div className="text-lg font-bold text-foreground">+2%</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              weekData.goalHit ? "bg-success" : "bg-primary"
            )}
            style={{
              width: `${Math.max(0, Math.min(100, (weekData.totalPL / 2) * 100))}%`,
            }}
          />
        </div>

        {weekData.hasProfit && (
          <div className="mt-3 text-xs text-success font-medium">
            Has at least 1 profitable trade this week
          </div>
        )}
      </GlassCard>

      {/* Day breakdown */}
      <GlassCard className="p-4">
        <div className="text-xs font-medium text-muted-foreground mb-3">Daily Breakdown</div>
        <div className="grid grid-cols-7 gap-2">
          {weekData.days.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{day.label}</span>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300",
                  day.trade && day.trade.result > 0 && "bg-success/15 text-success",
                  day.trade && day.trade.result <= 0 && "bg-destructive/15 text-destructive",
                  day.isSkip && !day.trade && "bg-muted/30 text-muted-foreground/60",
                  !day.trade && !day.isSkip && "bg-muted/20 text-muted-foreground"
                )}
              >
                {day.dayNum}
              </div>
              {day.trade && (
                <span className={cn(
                  "text-[10px] font-medium",
                  day.trade.result > 0 ? "text-success" : "text-destructive"
                )}>
                  {day.trade.result > 0 ? "+" : ""}{day.trade.result.toFixed(1)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Weekly Notes */}
      <GlassCard className="p-5">
        <div className="text-xs font-medium text-muted-foreground mb-2">Weekly Notes</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What did you learn this week?"
          className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 resize-none mb-3"
        />
        <button
          onClick={handleSaveNotes}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 active:scale-95 hover:opacity-90"
        >
          <Save className="w-3.5 h-3.5" />
          Save Notes
        </button>
      </GlassCard>
    </div>
  )
}
