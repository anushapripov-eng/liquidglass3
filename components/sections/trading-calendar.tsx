"use client"

import { useState, useMemo } from "react"
import { useStore, formatPercent } from "@/lib/store"
import type { Trade } from "@/lib/store"
import { GlassCard } from "@/components/glass-card"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  SkipForward,
  X,
} from "lucide-react"

export function TradingCalendar() {
  const store = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  const monthData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: {
      date: string
      dayNum: number
      trade?: Trade
      isSkip: boolean
      isToday: boolean
    }[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d)
      const dateStr = dateObj.toISOString().split("T")[0]
      const trade = store.trades.find((t) => t.date === dateStr)
      const isSkip = store.skipDays.includes(dateStr)
      const today = new Date()
      const isToday =
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear()

      days.push({ date: dateStr, dayNum: d, trade, isSkip, isToday })
    }

    return { days, startDayOfWeek, year, month }
  }, [currentMonth, store.trades, store.skipDays])

  const prevMonth = () => {
    setCurrentMonth(new Date(monthData.year, monthData.month - 1, 1))
  }
  const nextMonth = () => {
    setCurrentMonth(new Date(monthData.year, monthData.month + 1, 1))
  }

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handleDayClick = (day: (typeof monthData.days)[0]) => {
    if (day.trade) {
      setSelectedTrade(day.trade)
    } else if (!day.isSkip) {
      store.toggleSkipDay(day.date)
    } else {
      store.toggleSkipDay(day.date)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>

      {/* Calendar Grid */}
      <GlassCard className="p-4" variant="strong">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map((label) => (
            <div key={label} className="text-center text-xs font-medium text-muted-foreground py-1">
              {label}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: monthData.startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {monthData.days.map((day) => {
            const hasWin = day.trade && day.trade.result > 0
            const hasLoss = day.trade && day.trade.result < 0

            return (
              <button
                key={day.date}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-300 text-xs relative",
                  day.isToday && "ring-1 ring-primary/40",
                  hasWin && "bg-success/15 text-success",
                  hasLoss && "bg-destructive/15 text-destructive",
                  day.isSkip && !day.trade && "bg-muted/30 text-muted-foreground",
                  !day.trade && !day.isSkip && "text-foreground hover:bg-muted/30"
                )}
              >
                <span className={cn("font-medium", day.isToday && "text-primary")}>{day.dayNum}</span>
                {hasWin && <TrendingUp className="w-2.5 h-2.5" />}
                {hasLoss && <TrendingDown className="w-2.5 h-2.5" />}
                {day.isSkip && !day.trade && <SkipForward className="w-2.5 h-2.5" />}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Win</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Loss</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
            <span className="text-xs text-muted-foreground">Skip</span>
          </div>
        </div>
      </GlassCard>

      {/* Trade detail overlay */}
      {selectedTrade && (
        <GlassCard className="p-5" variant="strong">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                selectedTrade.result >= 0 ? "bg-success/10" : "bg-destructive/10"
              )}>
                {selectedTrade.result >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{selectedTrade.asset}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(selectedTrade.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedTrade(null)}
              className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={cn(
            "text-lg font-bold mb-2",
            selectedTrade.result >= 0 ? "text-success" : "text-destructive"
          )}>
            {formatPercent(selectedTrade.result)}
          </div>

          {selectedTrade.notes && (
            <p className="text-sm text-muted-foreground mb-3">{selectedTrade.notes}</p>
          )}

          {selectedTrade.imageUrl && (
            <img
              src={selectedTrade.imageUrl}
              alt="Trade screenshot"
              className="w-full rounded-xl border border-border"
            />
          )}
        </GlassCard>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Tap a day to toggle skip. Days with trades show green/red.
      </p>
    </div>
  )
}
