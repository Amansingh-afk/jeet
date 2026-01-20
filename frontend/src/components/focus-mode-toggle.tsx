"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Focus, Sparkles, Timer } from "lucide-react"
import { cn } from "@/lib/utils"

interface FocusModeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  showTimer?: boolean
  className?: string
}

export function FocusModeToggle({ 
  enabled, 
  onToggle, 
  showTimer = false,
  className 
}: FocusModeToggleProps) {
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0)

  // Timer logic when focus mode is enabled
  React.useEffect(() => {
    if (!enabled || !showTimer) {
      setElapsedSeconds(0)
      return
    }

    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [enabled, showTimer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Timer display */}
      <AnimatePresence>
        {enabled && showTimer && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground overflow-hidden"
          >
            <Timer className="h-3.5 w-3.5" />
            <span>{formatTime(elapsedSeconds)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => onToggle(!enabled)}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
          "border",
          enabled 
            ? "bg-foreground text-background border-foreground" 
            : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title={enabled ? "Exit focus mode" : "Enter focus mode"}
      >
        <AnimatePresence mode="wait">
          {enabled ? (
            <motion.div
              key="focus"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Focus className="h-4 w-4" />
              <span className="hidden sm:inline">Focus</span>
            </motion.div>
          ) : (
            <motion.div
              key="normal"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Normal</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

// Compact version for input area
export function FocusModeToggleCompact({ 
  enabled, 
  onToggle,
  className 
}: Omit<FocusModeToggleProps, 'showTimer'>) {
  return (
    <motion.button
      onClick={() => onToggle(!enabled)}
      className={cn(
        "relative p-2 rounded-lg transition-all",
        enabled 
          ? "bg-foreground/10 text-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={enabled ? "Exit focus mode" : "Enter focus mode"}
    >
      <AnimatePresence mode="wait">
        {enabled ? (
          <motion.div
            key="focus"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <Focus className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="normal"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
