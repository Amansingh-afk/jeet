"use client"

import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle2, Circle, Sparkles, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

interface PatternCardProps {
  id: string
  name: string
  oneLiner: string
  completed?: boolean
  className?: string
}

export function PatternCard({
  id,
  name,
  oneLiner,
  completed = false,
  className,
}: PatternCardProps) {
  const navigate = useNavigate()

  const handleAskJeet = () => {
    // Navigate to Ask Jeet with pattern context
    navigate(`/dashboard/ask?pattern=${id}`)
  }

  const handlePractice = () => {
    // Navigate to practice with pattern context
    navigate(`/dashboard/practice/quick?pattern=${id}`)
  }

  return (
    <motion.div
      className={cn(
        "rounded-xl border bg-card p-4 transition-all",
        "hover:border-primary/30 hover:shadow-sm",
        className
      )}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 mt-0.5">
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground mb-1">
            <span className="text-muted-foreground text-sm">{id}:</span>{" "}
            {name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            "{oneLiner}"
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pl-8">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handlePractice}
        >
          <Target className="h-3.5 w-3.5" />
          Practice
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handleAskJeet}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Ask Jeet
        </Button>
      </div>
    </motion.div>
  )
}
