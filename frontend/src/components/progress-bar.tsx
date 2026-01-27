"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  size = "md",
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full rounded-full bg-muted overflow-hidden",
          sizeClasses[size]
        )}
      >
        {animated ? (
          <motion.div
            className={cn(
              "h-full rounded-full bg-gradient-to-r from-primary to-primary/80",
              barClassName
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ) : (
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r from-primary to-primary/80",
              barClassName
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground mt-1">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}
