"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Search, Clock, Sparkles, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HistoryItem {
  id: string
  question: string
  patternName: string
  patternId: string
  timestamp: Date
}

// Mock history data
const mockHistory: HistoryItem[] = [
  {
    id: "1",
    question: "If 20% of A = 30% of B, then A:B = ?",
    patternName: "Percentage Comparison",
    patternId: "PC-003",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "2",
    question: "A sells an article to B at 20% profit, B sells to C at 10% profit. If C pays Rs 264, find cost price of A.",
    patternName: "Successive Profit/Loss",
    patternId: "PL-003",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: "3",
    question: "If price of sugar increases by 25%, by what percentage should consumption be reduced to keep expenditure same?",
    patternName: "Percentage Decrease",
    patternId: "PC-005",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: "4",
    question: "Train A and Train B start from stations X and Y towards each other. If they meet after 4 hours...",
    patternName: "Relative Speed",
    patternId: "STD-007",
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: "5",
    question: "A can do a work in 10 days, B in 15 days. In how many days will they finish together?",
    patternName: "Combined Work",
    patternId: "TW-002",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
  },
]

type FilterType = "all" | "today" | "week"

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

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) {
    return "Just now"
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

function groupByDate(items: HistoryItem[]): Record<string, HistoryItem[]> {
  const groups: Record<string, HistoryItem[]> = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  items.forEach((item) => {
    const itemDate = new Date(
      item.timestamp.getFullYear(),
      item.timestamp.getMonth(),
      item.timestamp.getDate()
    )

    let key: string
    if (itemDate.getTime() === today.getTime()) {
      key = "Today"
    } else if (itemDate.getTime() === yesterday.getTime()) {
      key = "Yesterday"
    } else {
      key = itemDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
  })

  return groups
}

export function History() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filter, setFilter] = React.useState<FilterType>("all")

  const filteredHistory = React.useMemo(() => {
    let items = mockHistory

    // Apply search filter
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.patternName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply time filter
    if (filter === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      items = items.filter((item) => item.timestamp >= today)
    } else if (filter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      items = items.filter((item) => item.timestamp >= weekAgo)
    }

    return items
  }, [searchQuery, filter])

  const groupedHistory = groupByDate(filteredHistory)

  const handleItemClick = (item: HistoryItem) => {
    // Navigate to Ask Jeet with the question pre-filled
    navigate(`/dashboard/ask?q=${encodeURIComponent(item.question)}`)
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
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground mt-1">
            Your past questions and conversations
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2">
            {(["all", "today", "week"] as FilterType[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                className="h-8 rounded-full text-xs"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "today" ? "Today" : "This Week"}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* History List */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Object.entries(groupedHistory).map(([date, items]) => (
            <motion.div key={date} variants={itemVariants}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {date}
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="group rounded-xl border bg-card p-4 transition-all hover:bg-accent/50 hover:border-primary/30 cursor-pointer"
                    onClick={() => handleItemClick(item)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">
                          {item.question}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            <Sparkles className="h-3 w-3" />
                            {item.patternName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(item.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle delete
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {filteredHistory.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No results found for "${searchQuery}"`
                  : "No history yet. Start asking questions!"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
