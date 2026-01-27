"use client"

import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatternCard } from "@/components/pattern-card"

// Mock patterns data - in production, this would come from the backend
const mockPatterns: Record<string, Array<{
  id: string
  name: string
  oneLiner: string
  completed: boolean
}>> = {
  percentage: [
    { id: "PC-001", name: "Basic Percentage", oneLiner: "X% of Y = XY/100", completed: true },
    { id: "PC-002", name: "Percentage Change", oneLiner: "Difference/Original × 100", completed: true },
    { id: "PC-003", name: "Percentage Comparison", oneLiner: "If X% of A = Y% of B, then A:B = Y:X", completed: true },
    { id: "PC-004", name: "Successive Percentage", oneLiner: "a + b + ab/100 for two successive changes", completed: false },
    { id: "PC-005", name: "Percentage Decrease", oneLiner: "Price ↓ X% → Consumption ↑ X/(100-X)%", completed: false },
    { id: "PC-006", name: "Population Growth", oneLiner: "P(1 + r/100)^n for compound growth", completed: false },
    { id: "PC-007", name: "Reverse Percentage", oneLiner: "New value = Original × (100 ± X)/100", completed: false },
    { id: "PC-008", name: "Fraction to Percentage", oneLiner: "1/n = (100/n)%", completed: false },
  ],
  "profit-loss": [
    { id: "PL-001", name: "Basic Profit/Loss", oneLiner: "Profit = SP - CP, Loss = CP - SP", completed: true },
    { id: "PL-002", name: "Profit/Loss Percentage", oneLiner: "Profit% = (Profit/CP) × 100", completed: true },
    { id: "PL-003", name: "Successive Transactions", oneLiner: "Use fraction method for chain sales", completed: false },
    { id: "PL-004", name: "Marked Price", oneLiner: "SP = MP × (100 - Discount%)/100", completed: false },
    { id: "PL-005", name: "False Weight", oneLiner: "Gain% = (Error/True Value) × 100", completed: false },
  ],
  "ratio-proportion": [
    { id: "RP-001", name: "Basic Ratio", oneLiner: "a:b = ka:kb for any k ≠ 0", completed: true },
    { id: "RP-002", name: "Ratio Joining", oneLiner: "A:B = 2:3, B:C = 4:5 → Make B same", completed: false },
    { id: "RP-003", name: "Direct Proportion", oneLiner: "x ∝ y means x/y = constant", completed: false },
    { id: "RP-004", name: "Inverse Proportion", oneLiner: "x ∝ 1/y means xy = constant", completed: false },
  ],
  "time-work": [
    { id: "TW-001", name: "Work Rate", oneLiner: "Rate = 1/Time to complete", completed: true },
    { id: "TW-002", name: "Combined Work", oneLiner: "1/T = 1/A + 1/B for A and B together", completed: true },
    { id: "TW-003", name: "LCM Method", oneLiner: "Take LCM of days as total work", completed: false },
    { id: "TW-004", name: "Work with Wages", oneLiner: "Wages ∝ Work done", completed: false },
  ],
}

const topicNames: Record<string, string> = {
  percentage: "Percentage",
  "profit-loss": "Profit & Loss",
  "ratio-proportion": "Ratio & Proportion",
  "time-work": "Time & Work",
  partnership: "Partnership",
  average: "Average",
  "speed-time-distance": "Speed, Time & Distance",
  "pipes-cisterns": "Pipes & Cisterns",
  "simple-interest": "Simple Interest",
  "compound-interest": "Compound Interest",
  "age-problems": "Age Problems",
  mensuration: "Mensuration",
  "data-interpretation": "Data Interpretation",
  "mixture-allegation": "Mixture & Allegation",
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
  hidden: { opacity: 0, y: 10 },
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

export function TopicDetail() {
  const { subject, topic } = useParams<{ subject: string; topic: string }>()
  const navigate = useNavigate()

  const patterns = topic ? mockPatterns[topic] || [] : []
  const topicName = topic ? topicNames[topic] || topic : ""

  const handleAskJeetAboutTopic = () => {
    navigate(`/dashboard/ask?topic=${topic}`)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 pb-24 md:pb-6">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Link to={`/dashboard/topics/${subject}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{topicName}</h1>
                <p className="text-sm text-muted-foreground">
                  {patterns.length} tricks
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pattern List */}
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {patterns.map((pattern) => (
            <motion.div key={pattern.id} variants={itemVariants}>
              <PatternCard
                id={pattern.id}
                name={pattern.name}
                oneLiner={pattern.oneLiner}
                completed={pattern.completed}
              />
            </motion.div>
          ))}

          {patterns.length === 0 && (
            <motion.p
              className="text-center text-muted-foreground py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No patterns available for this topic yet.
            </motion.p>
          )}
        </motion.div>

        {/* Floating Action Button */}
        <motion.div
          className="fixed bottom-20 md:bottom-6 right-4 md:right-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleAskJeetAboutTopic}
            className="h-12 px-5 rounded-full shadow-lg gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Ask Jeet about {topicName}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
