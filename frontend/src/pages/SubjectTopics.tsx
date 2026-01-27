"use client"

import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Percent,
  TrendingUp,
  Scale,
  Clock,
  Users,
  Calculator,
  Gauge,
  Droplets,
  Building2,
  Banknote,
  Calendar,
  Ruler,
  BarChart3,
  PiggyBank,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TopicCard } from "@/components/topic-card"
import { ProgressBar } from "@/components/progress-bar"
import { cn } from "@/lib/utils"

// Math topics with their patterns
const mathTopics = [
  { id: "percentage", name: "Percentage", icon: Percent, patternCount: 15, progress: 80 },
  { id: "profit-loss", name: "Profit & Loss", icon: TrendingUp, patternCount: 12, progress: 60 },
  { id: "ratio-proportion", name: "Ratio & Proportion", icon: Scale, patternCount: 10, progress: 30 },
  { id: "time-work", name: "Time & Work", icon: Clock, patternCount: 14, progress: 45 },
  { id: "partnership", name: "Partnership", icon: Users, patternCount: 6, progress: 0 },
  { id: "average", name: "Average", icon: Calculator, patternCount: 8, progress: 20 },
  { id: "speed-time-distance", name: "Speed, Time & Distance", icon: Gauge, patternCount: 16, progress: 10 },
  { id: "pipes-cisterns", name: "Pipes & Cisterns", icon: Droplets, patternCount: 7, progress: 0 },
  { id: "simple-interest", name: "Simple Interest", icon: Banknote, patternCount: 9, progress: 55 },
  { id: "compound-interest", name: "Compound Interest", icon: Building2, patternCount: 11, progress: 25 },
  { id: "age-problems", name: "Age Problems", icon: Calendar, patternCount: 8, progress: 40 },
  { id: "mensuration", name: "Mensuration", icon: Ruler, patternCount: 20, progress: 15 },
  { id: "data-interpretation", name: "Data Interpretation", icon: BarChart3, patternCount: 12, progress: 5 },
  { id: "mixture-allegation", name: "Mixture & Allegation", icon: PiggyBank, patternCount: 9, progress: 0 },
]

const subjectMeta: Record<string, { name: string; color: string }> = {
  math: { name: "Math", color: "from-blue-500 to-cyan-500" },
  reasoning: { name: "Reasoning", color: "from-purple-500 to-pink-500" },
  english: { name: "English", color: "from-emerald-500 to-teal-500" },
  gk: { name: "GK", color: "from-amber-500 to-orange-500" },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

export function SubjectTopics() {
  const { subject } = useParams<{ subject: string }>()
  const [searchQuery, setSearchQuery] = React.useState("")

  const meta = subject ? subjectMeta[subject] : null
  const topics = subject === "math" ? mathTopics : []

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate overall progress
  const totalPatterns = topics.reduce((sum, t) => sum + t.patternCount, 0)
  const completedPatterns = topics.reduce(
    (sum, t) => sum + Math.floor((t.progress / 100) * t.patternCount),
    0
  )
  const overallProgress = totalPatterns > 0 ? Math.round((completedPatterns / totalPatterns) * 100) : 0

  if (!meta) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Subject not found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Link to="/dashboard/topics">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{meta.name}</h1>
          </div>

          {/* Progress Summary Card */}
          <motion.div
            className={cn(
              "rounded-xl border bg-gradient-to-r p-4 text-white",
              meta.color
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm font-medium opacity-90 mb-2">
              {completedPatterns}/{totalPatterns} tricks mastered
            </p>
            <ProgressBar
              value={overallProgress}
              className="mb-2"
              barClassName="bg-white/90"
              size="md"
            />
            <p className="text-xs opacity-80">{overallProgress}% complete</p>
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="relative mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          />
        </motion.div>

        {/* Topic List */}
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredTopics.map((topic) => (
            <motion.div key={topic.id} variants={itemVariants}>
              <TopicCard
                id={topic.id}
                name={topic.name}
                icon={topic.icon}
                patternCount={topic.patternCount}
                progress={topic.progress}
                subject={subject!}
              />
            </motion.div>
          ))}

          {filteredTopics.length === 0 && (
            <motion.p
              className="text-center text-muted-foreground py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No topics found for "{searchQuery}"
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
