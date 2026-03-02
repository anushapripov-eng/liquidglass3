"use client"

import { useRef, type ReactNode, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  variant?: "default" | "subtle" | "strong"
  hover3d?: boolean
  onClick?: () => void
}

export function GlassCard({
  children,
  className,
  style,
  variant = "default",
  hover3d = false,
  onClick,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover3d || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    if (!hover3d || !cardRef.current) return
    cardRef.current.style.transform =
      "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
  }

  const glassClass =
    variant === "subtle" ? "glass-subtle" : variant === "strong" ? "glass-strong" : "glass"

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        glassClass,
        "rounded-2xl transition-transform duration-300 ease-out",
        hover3d && "will-change-transform",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {/* Top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glass-highlight to-transparent rounded-t-2xl" />
      {children}
    </div>
  )
}
