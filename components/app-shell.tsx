"use client"

import { useState } from "react"
import { DesktopSidebar, MobileTabBar, type Section } from "@/components/app-navigation"
import { ProfilePanel, ProfileAvatar } from "@/components/profile-panel"
import { BalanceEditor } from "@/components/balance-editor"
import { Dashboard } from "@/components/sections/dashboard"
import { TradeLog } from "@/components/sections/trade-log"
import { TradingCalendar } from "@/components/sections/trading-calendar"
import { WeeklyView } from "@/components/sections/weekly-view"
import { MistakesSection } from "@/components/sections/mistakes-section"
import { RulesSection } from "@/components/sections/rules-section"
import { AnalyticsSection } from "@/components/sections/analytics-section"
import { ExportSection } from "@/components/sections/export-section"
import { NewsSection } from "@/components/sections/news-section"
import { AuthScreen } from "@/components/auth-screen"
import { useStore, formatCurrency } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Settings2 } from "lucide-react"

const sectionTitles: Record<Section, string> = {
  dashboard: "Dashboard",
  "trade-log": "Trade Log",
  calendar: "Calendar",
  weekly: "Weekly View",
  mistakes: "Mistakes & Notes",
  rules: "Rules",
  analytics: "Analytics",
  news: "Gold News",
  export: "Export",
}

export function AppShell() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard")
  const [profileOpen, setProfileOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const store = useStore()

  // Auth gate
  if (!store.auth.isLoggedIn) {
    return <AuthScreen />
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "trade-log":
        return <TradeLog />
      case "calendar":
        return <TradingCalendar />
      case "weekly":
        return <WeeklyView />
      case "mistakes":
        return <MistakesSection />
      case "rules":
        return <RulesSection />
      case "analytics":
        return <AnalyticsSection />
      case "news":
        return <NewsSection />
      case "export":
        return <ExportSection />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-shift -z-10" />
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/[0.15] blur-[140px] animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-chart-2/[0.15] blur-[140px] animate-pulse duration-[10000ms] delay-500" />
      </div>

      {/* Desktop Sidebar */}
      <DesktopSidebar active={activeSection} onChange={setActiveSection} />

      {/* Main Content */}
      <main className={cn("relative z-10 pb-24 lg:pb-8 transition-all duration-500", "lg:pl-64")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass-strong">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <div>
              <h1 className="text-base font-semibold text-foreground">
                {sectionTitles[activeSection]}
              </h1>
              {activeSection === "dashboard" && (
                <button
                  onClick={() => setBalanceOpen(true)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Settings2 className="w-3 h-3" />
                  {formatCurrency(store.balance)}
                </button>
              )}
            </div>
            <ProfileAvatar onClick={() => setProfileOpen(true)} />
          </div>
        </header>

        {/* Content */}
        <div className="px-4 lg:px-8 py-4 max-w-3xl mx-auto">
          <div
            key={activeSection}
            className="animate-in fade-in slide-in-from-bottom-3 duration-350"
          >
            {renderSection()}
          </div>
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <MobileTabBar active={activeSection} onChange={setActiveSection} />

      {/* Overlays */}
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
      <BalanceEditor open={balanceOpen} onClose={() => setBalanceOpen(false)} />
    </div>
  )
}
