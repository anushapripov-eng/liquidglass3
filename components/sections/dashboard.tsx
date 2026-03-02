"use client"

import { useMemo } from "react"
import { useStore, formatCurrency, formatPercent, getWeekStart } from "@/lib/store"
import { GlassCard } from "@/components/glass-card"
import { TrendingUp, TrendingDown, Target, Flame, CalendarDays, SkipForward, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function Dashboard() {
  const store = useStore()

  const stats = useMemo(() => {
    const trades = store.trades
    const wins = trades.filter((t) => t.result > 0)
    const losses = trades.filter((t) => t.result < 0)
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0

    // Current streak
    let streak = 0
    const sorted = [...trades].sort((a, b) => b.date.localeCompare(a.date))
    if (sorted.length > 0) {
      const firstResult = sorted[0].result > 0
      for (const t of sorted) {
        if ((t.result > 0) === firstResult) streak++
        else break
      }
      if (!firstResult) streak = -streak
    }

    // Weekly progress
    const now = new Date()
    const currentWeekStart = getWeekStart(now)
    const weekTrades = trades.filter((t) => getWeekStart(new Date(t.date)) === currentWeekStart)
    const weeklyPL = weekTrades.reduce((sum, t) => sum + t.result, 0)
    const weeklyGoal = 2
    const weeklyProgress = Math.min((weeklyPL / weeklyGoal) * 100, 100)

    // Growth chart data
    let runningBalance = store.initialBalance
    const chartData = trades
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t) => {
        runningBalance += runningBalance * (t.result / 100)
        return {
          date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          balance: parseFloat(runningBalance.toFixed(2)),
        }
      })
    if (chartData.length > 0) {
      chartData.unshift({
        date: "Start",
        balance: store.initialBalance,
      })
    }

    // Total growth
    const totalGrowth = store.initialBalance > 0
      ? ((store.balance - store.initialBalance) / store.initialBalance) * 100
      : 0

    return {
      winRate,
      streak,
      weeklyPL,
      weeklyProgress,
      weeklyGoal,
      totalTradingDays: trades.length,
      skipDaysCount: store.skipDays.length,
      totalGrowth,
      chartData,
      wins: wins.length,
      losses: losses.length,
    }
  }, [store.trades, store.initialBalance, store.balance, store.skipDays])

  return (
    <div className="flex flex-col gap-4">
      {/* Balance Hero */}
      <GlassCard className="p-6 relative overflow-hidden group" variant="strong" hover3d>
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
        <div className="relative">
          <div className="text-xs font-medium text-muted-foreground mb-1">Current Balance</div>
          <div className="text-4xl font-extrabold text-foreground tracking-tight mb-2 drop-shadow-xl">
            {formatCurrency(store.balance)}
          </div>
          <div className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full shadow-inner",
            stats.totalGrowth >= 0 ? "bg-success/15 text-success glow-green" : "bg-destructive/15 text-destructive glow-red"
          )}>
            {stats.totalGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {formatPercent(stats.totalGrowth)} all time
          </div>
        </div>
      </GlassCard>

      {/* Weekly Progress */}
      <GlassCard className="p-5" hover3d>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Weekly Goal</span>
          </div>
          <span className={cn(
            "text-sm font-semibold",
            stats.weeklyPL >= stats.weeklyGoal ? "text-success" : "text-foreground"
          )}>
            {formatPercent(stats.weeklyPL)} / +{stats.weeklyGoal}%
          </span>
        </div>
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              stats.weeklyProgress >= 100 ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${Math.max(0, Math.min(100, stats.weeklyProgress))}%` }}
          />
        </div>
        {stats.weeklyPL >= stats.weeklyGoal && (
          <div className="mt-2 text-xs text-success font-medium">
            Goal reached! Week is done.
          </div>
        )}
      </GlassCard>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4" hover3d>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Win Rate</span>
          </div>
          <div className="text-xl font-bold text-foreground">{stats.winRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">{stats.wins}W / {stats.losses}L</div>
        </GlassCard>

        <GlassCard className="p-4" hover3d>
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", stats.streak >= 0 ? "bg-success/10" : "bg-destructive/10")}>
              <Flame className={cn("w-3.5 h-3.5", stats.streak >= 0 ? "text-success" : "text-destructive")} />
            </div>
            <span className="text-xs text-muted-foreground">Streak</span>
          </div>
          <div className={cn("text-2xl font-extrabold tracking-tight", stats.streak >= 0 ? "text-success glow-green" : "text-destructive glow-red")}>
            {Math.abs(stats.streak)} {stats.streak >= 0 ? "W" : "L"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{stats.streak >= 0 ? "Winning" : "Losing"} streak</div>
        </GlassCard>

        <GlassCard className="p-4" hover3d>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5 text-chart-4" />
            </div>
            <span className="text-xs text-muted-foreground">Trading Days</span>
          </div>
          <div className="text-xl font-bold text-foreground">{stats.totalTradingDays}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Total trades</div>
        </GlassCard>

        <GlassCard className="p-4" hover3d>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center">
              <SkipForward className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Skip Days</span>
          </div>
          <div className="text-xl font-bold text-foreground">{stats.skipDaysCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Days skipped</div>
        </GlassCard>
      </div>

      {/* Growth Chart */}
      {stats.chartData.length > 1 && (
        <GlassCard className="p-5" hover3d>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Growth Chart</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.1)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.15 0.02 260 / 0.85)",
                    border: "1px solid oklch(0.3 0.02 260 / 0.3)",
                    borderRadius: "12px",
                    backdropFilter: "blur(12px)",
                    color: "oklch(0.95 0 0)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Balance"]}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="oklch(0.55 0.18 250)"
                  strokeWidth={2}
                  fill="url(#balanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {stats.chartData.length <= 1 && (
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center" variant="subtle">
          <DollarSign className="w-8 h-8 text-muted-foreground/40 mb-3" />
          <div className="text-sm text-muted-foreground">Add trades to see your growth chart</div>
        </GlassCard>
      )}
    </div>
  )
}
