"use client"

import { useMemo } from "react"
import { useStore, formatPercent, getWeekStart } from "@/lib/store"
import { GlassCard } from "@/components/glass-card"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  Flame,
  Calendar,
  SkipForward,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function AnalyticsSection() {
  const store = useStore()

  const analytics = useMemo(() => {
    const trades = store.trades
    const wins = trades.filter((t) => t.result > 0)
    const losses = trades.filter((t) => t.result <= 0)
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0

    // Streaks
    let currentStreak = 0
    let bestWinStreak = 0
    let bestLossStreak = 0
    let tempWin = 0
    let tempLoss = 0
    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date))
    for (const t of sorted) {
      if (t.result > 0) {
        tempWin++
        tempLoss = 0
        bestWinStreak = Math.max(bestWinStreak, tempWin)
      } else {
        tempLoss++
        tempWin = 0
        bestLossStreak = Math.max(bestLossStreak, tempLoss)
      }
    }
    if (sorted.length > 0) {
      const lastIsWin = sorted[sorted.length - 1]?.result > 0
      currentStreak = lastIsWin ? tempWin : -tempLoss
    }

    // Best/worst days of the week
    const dayMap: Record<string, { total: number; count: number }> = {}
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    for (const t of trades) {
      const dayIdx = new Date(t.date).getDay()
      const label = dayLabels[dayIdx]
      if (!dayMap[label]) dayMap[label] = { total: 0, count: 0 }
      dayMap[label].total += t.result
      dayMap[label].count++
    }
    const dayPerformance = dayLabels.map((label) => ({
      day: label,
      avg: dayMap[label] ? dayMap[label].total / dayMap[label].count : 0,
      count: dayMap[label]?.count || 0,
    }))

    // Skip frequency
    const skipFreq = store.skipDays.length
    const totalDays = trades.length + skipFreq
    const skipRate = totalDays > 0 ? (skipFreq / totalDays) * 100 : 0

    // Total growth
    const totalGrowth = store.initialBalance > 0
      ? ((store.balance - store.initialBalance) / store.initialBalance) * 100
      : 0

    // Monthly performance
    const monthMap: Record<string, number> = {}
    for (const t of sorted) {
      const key = t.date.substring(0, 7) // YYYY-MM
      monthMap[key] = (monthMap[key] || 0) + t.result
    }
    const monthlyData = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => {
        const [y, m] = month.split("-")
        const date = new Date(parseInt(y), parseInt(m) - 1)
        return {
          month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          result: parseFloat(total.toFixed(2)),
        }
      })

    // Win/Loss pie data
    const pieData = [
      { name: "Wins", value: wins.length, color: "oklch(0.62 0.19 155)" },
      { name: "Losses", value: losses.length, color: "oklch(0.55 0.22 25)" },
    ]

    // Avg win/loss
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.result, 0) / wins.length : 0
    const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.result, 0) / losses.length : 0

    return {
      winRate,
      currentStreak,
      bestWinStreak,
      bestLossStreak,
      dayPerformance,
      skipFreq,
      skipRate,
      totalGrowth,
      monthlyData,
      pieData,
      avgWin,
      avgLoss,
      totalTrades: trades.length,
    }
  }, [store.trades, store.initialBalance, store.balance, store.skipDays])

  if (analytics.totalTrades === 0) {
    return (
      <GlassCard className="p-8 flex flex-col items-center text-center" variant="subtle">
        <BarChart3 className="w-8 h-8 text-muted-foreground/40 mb-3" />
        <span className="text-sm text-muted-foreground">Add trades to see analytics</span>
      </GlassCard>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Analytics
      </h2>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4" hover3d>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Win Rate</span>
          </div>
          <div className="text-xl font-bold text-foreground">{analytics.winRate.toFixed(1)}%</div>
        </GlassCard>

        <GlassCard className="p-4" hover3d>
          <div className="flex items-center gap-2 mb-2">
            <Flame className={cn("w-4 h-4", analytics.currentStreak >= 0 ? "text-success" : "text-destructive")} />
            <span className="text-xs text-muted-foreground">Current Streak</span>
          </div>
          <div className={cn("text-xl font-bold", analytics.currentStreak >= 0 ? "text-success" : "text-destructive")}>
            {Math.abs(analytics.currentStreak)}{analytics.currentStreak >= 0 ? "W" : "L"}
          </div>
        </GlassCard>

        <GlassCard className="p-4" hover3d>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Best Win Streak</span>
          </div>
          <div className="text-xl font-bold text-success">{analytics.bestWinStreak}</div>
        </GlassCard>

        <GlassCard className="p-4" hover3d>
          <div className="flex items-center gap-2 mb-2">
            <SkipForward className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Skip Rate</span>
          </div>
          <div className="text-xl font-bold text-foreground">{analytics.skipRate.toFixed(0)}%</div>
        </GlassCard>
      </div>

      {/* Averages */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-foreground">Averages</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Avg Win</div>
            <div className="text-sm font-bold text-success">{formatPercent(analytics.avgWin)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Avg Loss</div>
            <div className="text-sm font-bold text-destructive">{formatPercent(analytics.avgLoss)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Total Growth</div>
            <div className={cn("text-sm font-bold", analytics.totalGrowth >= 0 ? "text-success" : "text-destructive")}>
              {formatPercent(analytics.totalGrowth)}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Win/Loss pie */}
      <GlassCard className="p-4">
        <div className="text-sm font-medium text-foreground mb-3">Win / Loss Distribution</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {analytics.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "oklch(0.15 0.02 260 / 0.85)",
                  border: "1px solid oklch(0.3 0.02 260 / 0.3)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                  color: "oklch(0.95 0 0)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Wins ({analytics.pieData[0].value})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Losses ({analytics.pieData[1].value})</span>
          </div>
        </div>
      </GlassCard>

      {/* Day of week performance */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Best Days of Week</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.dayPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.15 0.02 260 / 0.85)",
                  border: "1px solid oklch(0.3 0.02 260 / 0.3)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                  color: "oklch(0.95 0 0)",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [formatPercent(value), "Avg"]}
              />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]} fill="oklch(0.55 0.18 250)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Monthly performance */}
      {analytics.monthlyData.length > 0 && (
        <GlassCard className="p-4">
          <div className="text-sm font-medium text-foreground mb-3">Monthly Performance</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.15 0.02 260 / 0.85)",
                    border: "1px solid oklch(0.3 0.02 260 / 0.3)",
                    borderRadius: "12px",
                    backdropFilter: "blur(12px)",
                    color: "oklch(0.95 0 0)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [formatPercent(value), "P/L"]}
                />
                <Bar
                  dataKey="result"
                  radius={[6, 6, 0, 0]}
                  fill="oklch(0.55 0.18 250)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
