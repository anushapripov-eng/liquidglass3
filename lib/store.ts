"use client"

import { useSyncExternalStore, useCallback } from "react"

// ── Types ──────────────────────────────────────────────────────────
export interface Trade {
  id: string
  date: string // ISO date string YYYY-MM-DD
  asset: string
  result: number // e.g. +1.5 or -0.8
  notes: string
  imageUrl?: string // base64 data URL
}

export interface WeeklyNote {
  id: string
  weekStart: string // ISO date of Monday
  notes: string
  balanceChange: number
  goalHit: boolean
}

export interface Mistake {
  id: string
  date: string
  description: string
  tag: "technical" | "broke-rules" | "other"
}

export interface ImportantPoint {
  id: string
  note: string
  pinned: boolean
  imageUrl?: string
  createdAt: string
}

export interface Rule {
  id: string
  text: string
  imageUrl?: string
  createdAt: string
}

export interface UserProfile {
  nickname: string
  avatarIndex: number
  customAvatarUrl?: string
  accountSize: number
  bio: string
}

export interface AuthUser {
  name: string
  password: string
  accountSize: number
  avatarIndex: number
}

export interface AppState {
  auth: {
    isLoggedIn: boolean
    currentUser: string | null // name
    users: AuthUser[]
  }
  profile: UserProfile
  balance: number
  initialBalance: number
  trades: Trade[]
  weeklyNotes: WeeklyNote[]
  mistakes: Mistake[]
  importantPoints: ImportantPoint[]
  rules: Rule[]
  skipDays: string[] // ISO dates
  accentColor: string
  finnhubApiKey: string
}

const defaultState: AppState = {
  auth: {
    isLoggedIn: false,
    currentUser: null,
    users: [],
  },
  profile: {
    nickname: "Trader",
    avatarIndex: 0,
    customAvatarUrl: undefined,
    accountSize: 10000,
    bio: "",
  },
  balance: 10000,
  initialBalance: 10000,
  trades: [],
  weeklyNotes: [],
  mistakes: [],
  importantPoints: [],
  rules: [
    { id: "r1", text: "Only trade after 11:00 Dubai time (GMT+4)", createdAt: new Date().toISOString() },
    { id: "r2", text: "Close all positions by 22:00 Dubai time", createdAt: new Date().toISOString() },
    { id: "r3", text: "Maximum 1 trade per day", createdAt: new Date().toISOString() },
    { id: "r4", text: "Use 15-minute chart for analysis", createdAt: new Date().toISOString() },
    { id: "r5", text: "Weekly goal: +2% on account", createdAt: new Date().toISOString() },
    { id: "r6", text: "1 profitable trade per week = week is done", createdAt: new Date().toISOString() },
  ],
  skipDays: [],
  accentColor: "blue",
  finnhubApiKey: "",
}

// ── Store ──────────────────────────────────────────────────────────
let state: AppState = defaultState
let listeners = new Set<() => void>()
let isInitialized = false

function loadFromStorage(): AppState {
  if (typeof window === "undefined") return defaultState
  try {
    const stored = localStorage.getItem("trading-journal-data")
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultState, ...parsed }
    }
  } catch {
    // ignore
  }
  return defaultState
}

function saveToStorage() {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("trading-journal-data", JSON.stringify(state))
  } catch {
    // ignore
  }
}

function emit() {
  saveToStorage()
  listeners.forEach((l) => l())
}

function getSnapshot(): AppState {
  if (!isInitialized && typeof window !== "undefined") {
    state = loadFromStorage()
    isInitialized = true
  }
  return state
}

function getServerSnapshot(): AppState {
  return defaultState
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (!isInitialized && typeof window !== "undefined") {
    state = loadFromStorage()
    isInitialized = true
  }
  return () => listeners.delete(listener)
}

// ── Hook ───────────────────────────────────────────────────────────
export function useStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    state = { ...state, profile: { ...state.profile, ...profile } }
    emit()
  }, [])

  const setBalance = useCallback((balance: number) => {
    state = { ...state, balance }
    emit()
  }, [])

  const setInitialBalance = useCallback((initialBalance: number) => {
    state = { ...state, initialBalance }
    emit()
  }, [])

  const addTrade = useCallback((trade: Omit<Trade, "id">) => {
    const newTrade = { ...trade, id: crypto.randomUUID() }
    state = { ...state, trades: [...state.trades, newTrade] }
    // Auto-update balance
    const change = state.balance * (trade.result / 100)
    state = { ...state, balance: state.balance + change }
    emit()
  }, [])

  const updateTrade = useCallback((id: string, updates: Partial<Trade>) => {
    state = {
      ...state,
      trades: state.trades.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }
    emit()
  }, [])

  const deleteTrade = useCallback((id: string) => {
    state = { ...state, trades: state.trades.filter((t) => t.id !== id) }
    emit()
  }, [])

  const addWeeklyNote = useCallback((note: Omit<WeeklyNote, "id">) => {
    const existing = state.weeklyNotes.find((n) => n.weekStart === note.weekStart)
    if (existing) {
      state = {
        ...state,
        weeklyNotes: state.weeklyNotes.map((n) =>
          n.weekStart === note.weekStart ? { ...n, ...note } : n
        ),
      }
    } else {
      state = {
        ...state,
        weeklyNotes: [...state.weeklyNotes, { ...note, id: crypto.randomUUID() }],
      }
    }
    emit()
  }, [])

  const addMistake = useCallback((mistake: Omit<Mistake, "id">) => {
    state = {
      ...state,
      mistakes: [...state.mistakes, { ...mistake, id: crypto.randomUUID() }],
    }
    emit()
  }, [])

  const deleteMistake = useCallback((id: string) => {
    state = { ...state, mistakes: state.mistakes.filter((m) => m.id !== id) }
    emit()
  }, [])

  const addImportantPoint = useCallback((point: Omit<ImportantPoint, "id" | "createdAt">) => {
    state = {
      ...state,
      importantPoints: [
        ...state.importantPoints,
        { ...point, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ],
    }
    emit()
  }, [])

  const deleteImportantPoint = useCallback((id: string) => {
    state = {
      ...state,
      importantPoints: state.importantPoints.filter((p) => p.id !== id),
    }
    emit()
  }, [])

  const moveImportantPoint = useCallback((id: string, direction: "up" | "down") => {
    const idx = state.importantPoints.findIndex((p) => p.id === id)
    if (idx < 0) return
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= state.importantPoints.length) return
    const items = [...state.importantPoints]
    ;[items[idx], items[newIdx]] = [items[newIdx], items[idx]]
    state = { ...state, importantPoints: items }
    emit()
  }, [])

  const addRule = useCallback((rule: Omit<Rule, "id" | "createdAt">) => {
    state = {
      ...state,
      rules: [
        ...state.rules,
        { ...rule, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ],
    }
    emit()
  }, [])

  const deleteRule = useCallback((id: string) => {
    state = { ...state, rules: state.rules.filter((r) => r.id !== id) }
    emit()
  }, [])

  const moveRule = useCallback((id: string, direction: "up" | "down") => {
    const idx = state.rules.findIndex((r) => r.id === id)
    if (idx < 0) return
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= state.rules.length) return
    const items = [...state.rules]
    ;[items[idx], items[newIdx]] = [items[newIdx], items[idx]]
    state = { ...state, rules: items }
    emit()
  }, [])

  const toggleSkipDay = useCallback((date: string) => {
    const isSkipped = state.skipDays.includes(date)
    state = {
      ...state,
      skipDays: isSkipped
        ? state.skipDays.filter((d) => d !== date)
        : [...state.skipDays, date],
    }
    emit()
  }, [])

  const setAccentColor = useCallback((color: string) => {
    state = { ...state, accentColor: color }
    emit()
  }, [])

  const setFinnhubApiKey = useCallback((key: string) => {
    state = { ...state, finnhubApiKey: key }
    emit()
  }, [])

  const registerUser = useCallback((user: AuthUser): { success: boolean; error?: string } => {
    const exists = state.auth.users.some(
      (u) => u.name.toLowerCase() === user.name.toLowerCase()
    )
    if (exists) return { success: false, error: "Username already taken" }
    state = {
      ...state,
      auth: {
        ...state.auth,
        users: [...state.auth.users, user],
        isLoggedIn: true,
        currentUser: user.name,
      },
      profile: {
        nickname: user.name,
        avatarIndex: user.avatarIndex,
        accountSize: user.accountSize,
        bio: "",
      },
      balance: user.accountSize,
      initialBalance: user.accountSize,
    }
    emit()
    return { success: true }
  }, [])

  const loginUser = useCallback((name: string, password: string): { success: boolean; error?: string } => {
    const found = state.auth.users.find(
      (u) => u.name.toLowerCase() === name.toLowerCase() && u.password === password
    )
    if (!found) return { success: false, error: "Invalid name or password" }
    state = {
      ...state,
      auth: { ...state.auth, isLoggedIn: true, currentUser: found.name },
      profile: {
        ...state.profile,
        nickname: found.name,
        avatarIndex: found.avatarIndex,
      },
    }
    emit()
    return { success: true }
  }, [])

  const logoutUser = useCallback(() => {
    state = {
      ...state,
      auth: { ...state.auth, isLoggedIn: false, currentUser: null },
    }
    emit()
  }, [])

  return {
    ...snap,
    updateProfile,
    setBalance,
    setInitialBalance,
    addTrade,
    updateTrade,
    deleteTrade,
    addWeeklyNote,
    addMistake,
    deleteMistake,
    addImportantPoint,
    deleteImportantPoint,
    moveImportantPoint,
    addRule,
    deleteRule,
    moveRule,
    toggleSkipDay,
    setAccentColor,
    setFinnhubApiKey,
    registerUser,
    loginUser,
    logoutUser,
  }
}

// ── Utility ────────────────────────────────────────────────────────
export function generateId() {
  return crypto.randomUUID()
}

export function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split("T")[0]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}
