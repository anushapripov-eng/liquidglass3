"use client"

import { useState, useEffect, useCallback } from "react"
import { useStore } from "@/lib/store"
import { GlassCard } from "@/components/glass-card"
import { cn } from "@/lib/utils"
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Key,
  AlertCircle,
  Clock,
  Globe,
} from "lucide-react"

interface NewsArticle {
  id: number
  headline: string
  source: string
  datetime: number
  url: string
  summary: string
  image: string
  category: string
}

export function NewsSection() {
  const store = useStore()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [apiKey, setApiKey] = useState(store.finnhubApiKey)
  const [showKeyInput, setShowKeyInput] = useState(!store.finnhubApiKey)

  const fetchNews = useCallback(async () => {
    const key = store.finnhubApiKey
    if (!key) {
      setShowKeyInput(true)
      return
    }

    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/news?category=forex&token=${key}`
      )
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("Invalid API key. Please check your Finnhub key.")
        } else {
          setError("Failed to fetch news. Please try again.")
        }
        setLoading(false)
        return
      }
      const data: NewsArticle[] = await res.json()
      // Filter for gold/XAU related news, or show general forex if none found
      const goldNews = data.filter(
        (n) =>
          n.headline.toLowerCase().includes("gold") ||
          n.headline.toLowerCase().includes("xau") ||
          n.summary.toLowerCase().includes("gold") ||
          n.summary.toLowerCase().includes("xau")
      )
      setNews(goldNews.length > 0 ? goldNews.slice(0, 20) : data.slice(0, 15))
    } catch {
      setError("Network error. Check your connection.")
    }
    setLoading(false)
  }, [store.finnhubApiKey])

  useEffect(() => {
    if (store.finnhubApiKey) {
      fetchNews()
    }
  }, [store.finnhubApiKey, fetchNews])

  const handleSaveKey = () => {
    if (!apiKey.trim()) return
    store.setFinnhubApiKey(apiKey.trim())
    setShowKeyInput(false)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHrs < 24) return `${diffHrs}h ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          Gold News
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
            title="API Key Settings"
          >
            <Key className="w-4 h-4" />
          </button>
          {store.finnhubApiKey && (
            <button
              onClick={fetchNews}
              disabled={loading}
              className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          )}
        </div>
      </div>

      {/* API Key Input */}
      {showKeyInput && (
        <GlassCard className="p-4" variant="strong">
          <div className="flex items-start gap-3 mb-3">
            <Key className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-foreground">Finnhub API Key</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get your free API key at{" "}
                <a
                  href="https://finnhub.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  finnhub.io
                </a>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
              placeholder="Enter your API key"
              type="password"
            />
            <button
              onClick={handleSaveKey}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 active:scale-[0.97] hover:opacity-90"
            >
              Save
            </button>
          </div>
        </GlassCard>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* No API Key */}
      {!store.finnhubApiKey && !showKeyInput && (
        <GlassCard className="p-8 text-center" variant="subtle">
          <Key className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Add your Finnhub API key to see latest gold news</p>
          <button
            onClick={() => setShowKeyInput(true)}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Add API Key
          </button>
        </GlassCard>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="p-4" variant="subtle">
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-4 bg-muted/50 rounded-lg w-3/4" />
                <div className="h-3 bg-muted/30 rounded-lg w-full" />
                <div className="flex gap-3">
                  <div className="h-3 bg-muted/20 rounded w-16" />
                  <div className="h-3 bg-muted/20 rounded w-12" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* News list */}
      {!loading && news.length > 0 && (
        <div className="flex flex-col gap-3">
          {news.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <GlassCard className="p-4 transition-all duration-300 hover:scale-[1.01]" variant="subtle" hover3d>
                <div className="flex gap-3">
                  {article.image && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted/30">
                      <img
                        src={article.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {article.headline}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Globe className="w-3 h-3" />
                        {article.source}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTime(article.datetime)}
                      </span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </a>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && store.finnhubApiKey && news.length === 0 && !error && (
        <GlassCard className="p-8 text-center" variant="subtle">
          <Newspaper className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No gold news available right now</p>
          <button onClick={fetchNews} className="mt-3 text-xs text-primary hover:underline">
            Refresh
          </button>
        </GlassCard>
      )}
    </div>
  )
}
