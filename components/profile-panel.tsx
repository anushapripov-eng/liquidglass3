"use client"

import { useState } from "react"
import { useStore, formatCurrency } from "@/lib/store"
import { cn } from "@/lib/utils"
import { X, Check, Sun, Moon, Palette, LogOut, Key } from "lucide-react"
import { useTheme } from "next-themes"

const AVATARS = [
  { bg: "bg-blue-500", emoji: "T", label: "Trader" },
  { bg: "bg-emerald-500", emoji: "B", label: "Bull" },
  { bg: "bg-orange-500", emoji: "F", label: "Fox" },
  { bg: "bg-rose-500", emoji: "R", label: "Red" },
  { bg: "bg-violet-500", emoji: "V", label: "Viper" },
  { bg: "bg-cyan-500", emoji: "S", label: "Shark" },
  { bg: "bg-amber-500", emoji: "G", label: "Gold" },
  { bg: "bg-pink-500", emoji: "P", label: "Pro" },
]

const ACCENT_COLORS = [
  { name: "blue", color: "bg-blue-500" },
  { name: "emerald", color: "bg-emerald-500" },
  { name: "orange", color: "bg-orange-500" },
  { name: "rose", color: "bg-rose-500" },
  { name: "cyan", color: "bg-cyan-500" },
  { name: "amber", color: "bg-amber-500" },
]

interface ProfilePanelProps {
  open: boolean
  onClose: () => void
}

export function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  const store = useStore()
  const { theme, setTheme } = useTheme()
  const [nickname, setNickname] = useState(store.profile.nickname)
  const [bio, setBio] = useState(store.profile.bio)
  const [accountSize, setAccountSize] = useState(store.profile.accountSize.toString())
  const [selectedAvatar, setSelectedAvatar] = useState(store.profile.avatarIndex)
  const [finnhubKey, setFinnhubKey] = useState(store.finnhubApiKey)

  const winRate = store.trades.length > 0
    ? ((store.trades.filter((t) => t.result > 0).length / store.trades.length) * 100).toFixed(1)
    : "0.0"

  const totalGrowth = store.initialBalance > 0
    ? (((store.balance - store.initialBalance) / store.initialBalance) * 100).toFixed(2)
    : "0.00"

  const handleSave = () => {
    store.updateProfile({
      nickname,
      bio,
      accountSize: parseFloat(accountSize) || 0,
      avatarIndex: selectedAvatar,
    })
    store.setFinnhubApiKey(finnhubKey)
    onClose()
  }

  const handleLogout = () => {
    store.logoutUser()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity duration-500" />
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md glass-strong overflow-y-auto animate-in slide-in-from-right duration-400"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-foreground">Profile</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar selection */}
          <div className="flex flex-col items-center mb-8">
            <label className="cursor-pointer group relative">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => store.updateProfile({ customAvatarUrl: ev.target?.result as string });
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground mb-4 ring-2 ring-primary/30 ring-offset-2 ring-offset-background transition-all duration-300 overflow-hidden",
                !store.profile.customAvatarUrl && (AVATARS[selectedAvatar]?.bg || "bg-blue-500")
              )}>
                {store.profile.customAvatarUrl ? (
                  <img src={store.profile.customAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  AVATARS[selectedAvatar]?.emoji || "T"
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                  <span className="text-xs text-white">Upload</span>
                </div>
              </div>
            </label>
            <div className="flex gap-2 flex-wrap justify-center">
              {AVATARS.map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAvatar(i)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground transition-all duration-300",
                    avatar.bg,
                    selectedAvatar === i
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="glass-subtle rounded-xl p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
              <div className="text-sm font-semibold text-foreground">{winRate}%</div>
            </div>
            <div className="glass-subtle rounded-xl p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Trades</div>
              <div className="text-sm font-semibold text-foreground">{store.trades.length}</div>
            </div>
            <div className="glass-subtle rounded-xl p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Growth</div>
              <div className={cn("text-sm font-semibold", parseFloat(totalGrowth) >= 0 ? "text-success" : "text-destructive")}>
                {parseFloat(totalGrowth) >= 0 ? "+" : ""}{totalGrowth}%
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nickname</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                placeholder="Your nickname"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 resize-none"
                placeholder="About you..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Account Size (USD)</label>
              <input
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                type="number"
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                placeholder="10000"
              />
            </div>

            {/* Theme toggle */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Theme</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                    theme === "light" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                    theme === "dark" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
            </div>

            {/* Accent color */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Accent Color
              </label>
              <div className="flex gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => store.setAccentColor(c.name)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all duration-300",
                      c.color,
                      store.accentColor === c.name
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Finnhub API Key */}
          <div className="mt-4">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Finnhub API Key
            </label>
            <input
              value={finnhubKey}
              onChange={(e) => setFinnhubKey(e.target.value)}
              type="password"
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
              placeholder="Your Finnhub API key"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Free key from{" "}
              <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                finnhub.io
              </a>
              {" "}for gold news
            </p>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 active:scale-[0.98] hover:opacity-90"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive font-medium text-sm transition-all duration-300 active:scale-[0.98] hover:bg-destructive/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>


    </div>
  )
}

export function ProfileAvatar({ onClick }: { onClick: () => void }) {
  const store = useStore()
  const avatar = AVATARS[store.profile.avatarIndex] || AVATARS[0]

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground transition-all duration-300 hover:scale-110 active:scale-95 ring-2 ring-transparent hover:ring-primary/30 overflow-hidden",
        !store.profile.customAvatarUrl && avatar.bg
      )}
    >
      {store.profile.customAvatarUrl ? (
        <img src={store.profile.customAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        avatar.emoji
      )}
    </button>
  )
}
