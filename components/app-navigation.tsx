"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  BarChart3,
  AlertTriangle,
  Shield,
  TrendingUp,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Newspaper,
} from "lucide-react"

export type Section =
  | "dashboard"
  | "trade-log"
  | "calendar"
  | "weekly"
  | "mistakes"
  | "rules"
  | "analytics"
  | "news"
  | "export"

interface NavItem {
  id: Section
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "trade-log", label: "Trade Log", icon: BookOpen },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "weekly", label: "Weekly", icon: Layers },
  { id: "mistakes", label: "Mistakes", icon: AlertTriangle },
  { id: "rules", label: "Rules", icon: Shield },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "news", label: "News", icon: Newspaper },
  { id: "export", label: "Export", icon: FileDown },
]

interface AppNavigationProps {
  active: Section
  onChange: (section: Section) => void
}

export function DesktopSidebar({ active, onChange }: AppNavigationProps) {
  const [collapsed, setCollapsed] = useState(false)
  const indicatorRef = useRef<HTMLDivElement>(null)

  return (
    <nav
      className={cn(
        "hidden lg:flex flex-col h-screen glass-strong fixed left-0 top-0 z-40 transition-all duration-500 ease-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 pb-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-foreground tracking-tight whitespace-nowrap overflow-hidden">
            TradeJournal
          </span>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 px-3 py-4 flex flex-col gap-1 relative">
        <div ref={indicatorRef} className="absolute" />
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-primary/5 ring-1 ring-primary/20" />
              )}
              <Icon className={cn("w-5 h-5 shrink-0 relative z-10 transition-transform duration-300", isActive && "scale-110")} />
              {!collapsed && (
                <span className="relative z-10 text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-4 flex items-center justify-center gap-2 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        {!collapsed && <span className="text-xs">Collapse</span>}
      </button>
    </nav>
  )
}

export function MobileTabBar({ active, onChange }: AppNavigationProps) {
  const mobileItems = navItems.slice(0, 5) // Show first 5 + more
  const moreItems = navItems.slice(5)
  const [showMore, setShowMore] = useState(false)

  const isMoreActive = moreItems.some((i) => i.id === active)

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-20 left-4 right-4 glass-strong rounded-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {moreItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChange(item.id)
                    setShowMore(false)
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200",
                    active === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-strong">
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] h-16">
          {mobileItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-300",
              isMoreActive || showMore ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-current" />
                <div className="w-1 h-1 rounded-full bg-current" />
                <div className="w-1 h-1 rounded-full bg-current" />
              </div>
            </div>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
