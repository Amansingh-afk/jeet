"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Flame, Zap, FileText, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

interface PracticeModeCardProps {
  icon: React.ElementType
  title: string
  description: string
  to: string
  color: string
  disabled?: boolean
}

function PracticeModeCard({
  icon: Icon,
  title,
  description,
  to,
  color,
  disabled = false,
}: PracticeModeCardProps) {
  const content = (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border p-6 transition-all text-center",
        "bg-card hover:bg-accent/50",
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:border-primary/30 hover:shadow-md"
      )}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl mb-3",
          color
        )}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
      {disabled && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-2">
          Coming Soon
        </span>
      )}
    </motion.div>
  )

  if (disabled) {
    return content
  }

  return <Link to={to}>{content}</Link>
}

interface RecentPracticeItem {
  topic: string
  score: number
  time: string
}

const recentPractice: RecentPracticeItem[] = [
  { topic: "Percentage", score: 80, time: "2 hours ago" },
  { topic: "Profit & Loss", score: 60, time: "Yesterday" },
  { topic: "Time & Work", score: 45, time: "2 days ago" },
]

export function Practice() {
  // Mock streak data
  const streak = 7

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Practice</h1>
          <p className="text-muted-foreground mt-1">
            Master tricks through deliberate practice
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Daily Challenge Hero Card */}
          <motion.div variants={itemVariants}>
            <Link to="/dashboard/practice/daily">
              <motion.div
                className="relative rounded-2xl border bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white mb-6 overflow-hidden"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="h-6 w-6" />
                    <h2 className="text-xl font-bold">Today's Challenge</h2>
                  </div>

                  <p className="text-white/90 mb-4">
                    5 questions, 5 minutes
                  </p>
                  <p className="text-sm text-white/80 mb-4">
                    Topic: <span className="font-semibold">Percentage</span>
                  </p>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="secondary"
                      className="bg-white text-orange-600 hover:bg-white/90 gap-2"
                    >
                      Start Challenge
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2 text-white/90">
                      <Flame className="h-5 w-5 text-yellow-300" />
                      <span className="font-bold text-lg">{streak}</span>
                      <span className="text-sm">day streak</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Practice Modes Grid */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Practice Modes
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <PracticeModeCard
                icon={Zap}
                title="Quick Practice"
                description="Topic-based questions"
                to="/dashboard/practice/quick"
                color="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <PracticeModeCard
                icon={FileText}
                title="PYQ Papers"
                description="Past year questions"
                to="/dashboard/practice/pyq"
                color="bg-gradient-to-br from-purple-500 to-pink-500"
                disabled
              />
            </div>
          </motion.div>

          {/* Recent Practice */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Recent Practice
            </h3>
            <div className="space-y-2">
              {recentPractice.map((item, index) => (
                <motion.div
                  key={item.topic}
                  className="flex items-center justify-between rounded-xl border bg-card p-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        item.score >= 70
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : item.score >= 50
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      <span className="text-sm font-bold">{item.score}%</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.topic}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
