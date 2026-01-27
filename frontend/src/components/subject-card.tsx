"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface SubjectCardProps {
  id: string
  name: string
  icon: LucideIcon
  topicCount: number
  color: string
  disabled?: boolean
  className?: string
}

export function SubjectCard({
  id,
  name,
  icon: Icon,
  topicCount,
  color,
  disabled = false,
  className,
}: SubjectCardProps) {
  const cardContent = (
    <motion.div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border p-6 transition-all",
        "bg-card hover:bg-accent/50",
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:border-primary/30 hover:shadow-md",
        className
      )}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {/* Icon with gradient background */}
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-xl mb-3",
          color
        )}
      >
        <Icon className="h-7 w-7 text-white" />
      </div>

      {/* Subject name */}
      <h3 className="text-base font-semibold text-foreground mb-1">{name}</h3>

      {/* Topic count or Coming Soon badge */}
      {disabled ? (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Coming Soon
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">
          {topicCount} topics
        </span>
      )}
    </motion.div>
  )

  if (disabled) {
    return cardContent
  }

  return (
    <Link to={`/dashboard/topics/${id}`} className="block">
      {cardContent}
    </Link>
  )
}
