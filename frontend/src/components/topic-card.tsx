"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProgressBar } from "./progress-bar"
import type { LucideIcon } from "lucide-react"

interface TopicCardProps {
  id: string
  name: string
  icon?: LucideIcon
  patternCount: number
  progress?: number
  subject: string
  className?: string
}

export function TopicCard({
  id,
  name,
  icon: Icon,
  patternCount,
  progress = 0,
  subject,
  className,
}: TopicCardProps) {
  return (
    <Link to={`/dashboard/topics/${subject}/${id}`}>
      <motion.div
        className={cn(
          "flex items-center gap-4 rounded-xl border bg-card p-4 transition-all",
          "hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm",
          className
        )}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Icon */}
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-foreground truncate">{name}</h4>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {patternCount} tricks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ProgressBar value={progress} size="sm" className="flex-1" />
            <span className="text-xs text-muted-foreground shrink-0">
              {progress}%
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </motion.div>
    </Link>
  )
}
