"use client"

import { useState, useCallback } from "react"
import { useStore, formatCurrency, formatPercent, getWeekStart } from "@/lib/store"
import { GlassCard } from "@/components/glass-card"
import { cn } from "@/lib/utils"
import { FileDown, Loader2, CheckCircle2, Calendar, CalendarDays } from "lucide-react"

const AVATARS = [
  { bg: "#3b82f6", letter: "T" },
  { bg: "#10b981", letter: "B" },
  { bg: "#f97316", letter: "F" },
  { bg: "#f43f5e", letter: "R" },
  { bg: "#8b5cf6", letter: "V" },
  { bg: "#06b6d4", letter: "S" },
  { bg: "#f59e0b", letter: "G" },
  { bg: "#ec4899", letter: "P" },
]

type Period = "this-week" | "this-month" | "all-time"

export function ExportSection() {
  const store = useStore()
  const [period, setPeriod] = useState<Period>("this-month")
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const generatePDF = useCallback(async () => {
    setGenerating(true)
    setDone(false)

    const now = new Date()
    const currentWeekStart = getWeekStart(now)

    // Filter trades by period
    let trades = [...store.trades]
    let periodLabel = "All Time"

    if (period === "this-week") {
      trades = store.trades.filter((t) => {
        const weekStart = getWeekStart(new Date(t.date))
        return weekStart === currentWeekStart
      })
      const weekEnd = new Date(currentWeekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      periodLabel = `Week of ${new Date(currentWeekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    } else if (period === "this-month") {
      trades = store.trades.filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      periodLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    }

    const sorted = trades.sort((a, b) => a.date.localeCompare(b.date))
    const wins = sorted.filter((t) => t.result > 0)
    const losses = sorted.filter((t) => t.result <= 0)
    const winRate = sorted.length > 0 ? ((wins.length / sorted.length) * 100).toFixed(1) : "0.0"
    const totalPL = sorted.reduce((s, t) => s + t.result, 0)
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.result, 0) / wins.length : 0
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.result, 0) / losses.length) : 0
    const profitFactor = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : wins.length > 0 ? "Inf" : "0.00"

    const totalGrowth = store.initialBalance > 0
      ? ((store.balance - store.initialBalance) / store.initialBalance * 100).toFixed(2)
      : "0.00"

    const avatar = AVATARS[store.profile.avatarIndex] || AVATARS[0]

    // Build HTML
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>TradeJournal Report - ${store.profile.nickname}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { margin: 0; size: A4; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Helvetica, Arial, sans-serif;
    color: #1a1a2e;
    background: #f8f9fa;
    line-height: 1.5;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 40mm 20mm;
    margin: 0 auto;
    background: white;
    page-break-after: always;
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  }
  .cover {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(135deg, #0f172a, #1e293b);
    color: white;
  }
  .cover-title {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 24px;
    letter-spacing: -0.04em;
    background: linear-gradient(to right, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .cover-subtitle {
    font-size: 24px;
    font-weight: 300;
    color: #94a3b8;
    margin-bottom: 60px;
  }
  .cover-details {
    font-size: 16px;
    color: #cbd5e1;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 40px;
    width: 60%;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f1f5f9;
  }
  .brand-name {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }
  .brand-sub {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .section-title {
    font-size: 24px;
    font-weight: 800;
    margin: 40px 0 20px;
    color: #0f172a;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 40px;
  }
  .stat-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }
  .stat-label {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }
  .green { color: #10b981; }
  .red { color: #ef4444; }
  .neutral { color: #0f172a; }
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 20px;
  }
  th {
    background: #f8fafc;
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }
  td {
    padding: 16px;
    font-size: 14px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
  }
  .badge-green { background: #d1fae5; color: #059669; }
  .badge-red { background: #fee2e2; color: #dc2626; }
  .footer {
    position: absolute;
    bottom: 20mm;
    left: 20mm;
    right: 20mm;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #94a3b8;
    border-top: 1px solid #f1f5f9;
    padding-top: 20px;
  }
</style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover">
    <div class="brand-sub" style="color: #60a5fa; margin-bottom: 20px;">Premium Financial Report</div>
    <div class="cover-title">Trading Performance Analysis</div>
    <div class="cover-subtitle">${periodLabel}</div>
    <div class="cover-details">
      <div style="margin-bottom: 12px; font-weight: 600; font-size: 20px;">Prepared for: ${store.profile.nickname}</div>
      <div style="color: #94a3b8;">Account Size: ${formatCurrency(store.profile.accountSize)}</div>
      <div style="margin-top: 24px; font-size: 14px; color: #64748b;">Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
    </div>
  </div>

  <!-- Summary Page -->
  <div class="page">
    <div class="header">
      <div>
        <div class="brand-name">TradeJournal</div>
        <div class="brand-sub">Performance Summary</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 700; color: #0f172a;">${store.profile.nickname}</div>
        <div class="brand-sub">${periodLabel}</div>
      </div>
    </div>

    <div class="section-title">Executive Summary</div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Net Profit/Loss</div>
        <div class="stat-value ${totalPL >= 0 ? 'green' : 'red'}">${formatPercent(totalPL)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Win Rate</div>
        <div class="stat-value neutral">${winRate}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Profit Factor</div>
        <div class="stat-value neutral">${profitFactor}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Trades</div>
        <div class="stat-value neutral">${sorted.length}</div>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="stat-card">
        <div class="stat-label">Avg Winning Trade</div>
        <div class="stat-value green">${avgWin > 0 ? '+' : ''}${avgWin.toFixed(2)}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Losing Trade</div>
        <div class="stat-value red">-${avgLoss.toFixed(2)}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Account Growth</div>
        <div class="stat-value ${parseFloat(totalGrowth) >= 0 ? 'green' : 'red'}">${parseFloat(totalGrowth) >= 0 ? '+' : ''}${totalGrowth}%</div>
      </div>
    </div>
    
    <div class="footer">
      <div>TradeJournal &bull; Confidential</div>
      <div>Page 1 of 2</div>
    </div>
  </div>

  <!-- Details Page -->
  <div class="page">
    <div class="header">
      <div>
        <div class="brand-name">TradeJournal</div>
        <div class="brand-sub">Trade Ledger</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 700; color: #0f172a;">${store.profile.nickname}</div>
      </div>
    </div>

    <div class="section-title">Trade Ledger</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Asset</th>
          <th>Result</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map((t) => `
          <tr>
            <td style="font-weight: 600;">${new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
            <td style="font-weight: 700; color: #0f172a;">${t.asset}</td>
            <td><span class="badge ${t.result >= 0 ? 'badge-green' : 'badge-red'}">${formatPercent(t.result)}</span></td>
            <td style="color: #64748b;">${t.notes || '—'}</td>
          </tr>
        `).join("")}
        ${sorted.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: #9ca3af; padding: 40px;">No trades executed in this period</td></tr>' : ''}
      </tbody>
    </table>

    <div class="footer">
      <div>TradeJournal &bull; Confidential</div>
      <div>Page 2 of 2</div>
    </div>
  </div>
</body>
</html>`

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }

    await new Promise((r) => setTimeout(r, 800))
    setGenerating(false)
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }, [period, store])

  const wins = store.trades.filter((t) => t.result > 0)
  const losses = store.trades.filter((t) => t.result <= 0)
  const avgWinVal = wins.length > 0 ? wins.reduce((s, t) => s + t.result, 0) / wins.length : 0
  const avgLossVal = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.result, 0) / losses.length) : 0
  const profitFactor = avgLossVal > 0 ? (avgWinVal / avgLossVal).toFixed(2) : wins.length > 0 ? "Inf" : "0.00"
  const totalGrowth = store.initialBalance > 0
    ? ((store.balance - store.initialBalance) / store.initialBalance * 100).toFixed(2)
    : "0.00"
  const winRate = store.trades.length > 0
    ? ((wins.length / store.trades.length) * 100).toFixed(1)
    : "0.0"

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <FileDown className="w-5 h-5 text-primary" />
        Export Report
      </h2>

      <GlassCard className="p-5" variant="strong">
        <div className="text-sm font-medium text-foreground mb-4">Select Report Period</div>

        <div className="flex gap-2 mb-6">
          {([
            { value: "this-week" as Period, label: "This Week", icon: Calendar },
            { value: "this-month" as Period, label: "This Month", icon: CalendarDays },
            { value: "all-time" as Period, label: "All Time", icon: FileDown },
          ]).map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                period === p.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <p.icon className="w-3.5 h-3.5" />
              {p.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="glass-subtle rounded-xl p-4 mb-6">
          <div className="text-xs text-muted-foreground mb-3 font-medium">Report Preview</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-muted-foreground">Trader</div>
              <div className="text-sm font-semibold text-foreground">{store.profile.nickname}</div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Balance</div>
              <div className="text-sm font-semibold text-foreground">{formatCurrency(store.balance)}</div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Win Rate</div>
              <div className="text-sm font-semibold text-foreground">{winRate}%</div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Profit Factor</div>
              <div className="text-sm font-semibold text-foreground">{profitFactor}</div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Growth</div>
              <div className={cn("text-sm font-semibold", parseFloat(totalGrowth) >= 0 ? "text-success" : "text-destructive")}>
                {parseFloat(totalGrowth) >= 0 ? "+" : ""}{totalGrowth}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Total Trades</div>
              <div className="text-sm font-semibold text-foreground">{store.trades.length}</div>
            </div>
          </div>
        </div>

        <button
          onClick={generatePDF}
          disabled={generating}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 active:scale-[0.98]",
            done
              ? "bg-success text-success-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90",
            generating && "opacity-70"
          )}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : done ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Report Ready
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              Generate PDF Report
            </>
          )}
        </button>
      </GlassCard>

      <p className="text-xs text-muted-foreground text-center text-pretty">
        Report opens in a new window with your name, avatar, balance, win rate, profit factor, and full trade history. Use browser print to save as PDF.
      </p>
    </div>
  )
}
