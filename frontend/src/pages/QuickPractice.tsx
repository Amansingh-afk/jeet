"use client"

import * as React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  Target,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ProgressBar } from "@/components/progress-bar"

interface MCQOption {
  key: string
  text: string
}

interface Question {
  id: string
  text: string
  options: MCQOption[]
  correctAnswer: string
  patternId: string
  patternName: string
  explanation?: string
}

// Mock questions for practice
const mockQuestions: Record<string, Question[]> = {
  percentage: [
    {
      id: "q1",
      text: "If 20% of A equals 30% of B, then A:B is?",
      options: [
        { key: "a", text: "2:3" },
        { key: "b", text: "3:2" },
        { key: "c", text: "4:5" },
        { key: "d", text: "5:4" },
      ],
      correctAnswer: "b",
      patternId: "PC-003",
      patternName: "Percentage Comparison",
      explanation: "20% of A = 30% of B means (20/100)A = (30/100)B, so A/B = 30/20 = 3/2",
    },
    {
      id: "q2",
      text: "If the price of sugar increases by 25%, by what percentage should consumption be reduced to keep expenditure the same?",
      options: [
        { key: "a", text: "20%" },
        { key: "b", text: "25%" },
        { key: "c", text: "15%" },
        { key: "d", text: "30%" },
      ],
      correctAnswer: "a",
      patternId: "PC-005",
      patternName: "Percentage Decrease",
      explanation: "Using formula: X/(100+X) × 100 = 25/125 × 100 = 20%",
    },
    {
      id: "q3",
      text: "A number is increased by 20% and then decreased by 20%. What is the net change?",
      options: [
        { key: "a", text: "No change" },
        { key: "b", text: "4% increase" },
        { key: "c", text: "4% decrease" },
        { key: "d", text: "2% decrease" },
      ],
      correctAnswer: "c",
      patternId: "PC-004",
      patternName: "Successive Percentage",
      explanation: "Using formula: a + b + ab/100 = 20 - 20 - 400/100 = -4% (decrease)",
    },
  ],
  "profit-loss": [
    {
      id: "q1",
      text: "A sells an article to B at 20% profit. If the cost price of A is Rs 100, what is the selling price to B?",
      options: [
        { key: "a", text: "Rs 100" },
        { key: "b", text: "Rs 110" },
        { key: "c", text: "Rs 120" },
        { key: "d", text: "Rs 125" },
      ],
      correctAnswer: "c",
      patternId: "PL-001",
      patternName: "Basic Profit/Loss",
      explanation: "SP = CP × (100 + Profit%)/100 = 100 × 120/100 = Rs 120",
    },
  ],
}

const topicNames: Record<string, string> = {
  percentage: "Percentage",
  "profit-loss": "Profit & Loss",
  "ratio-proportion": "Ratio & Proportion",
  "time-work": "Time & Work",
}

export function QuickPractice() {
  const [searchParams] = useSearchParams()
  const topic = searchParams.get("topic") || "percentage"

  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null)
  const [isRevealed, setIsRevealed] = React.useState(false)
  const [correctCount, setCorrectCount] = React.useState(0)
  const [isCompleted, setIsCompleted] = React.useState(false)

  const questions = mockQuestions[topic] || mockQuestions["percentage"]
  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length

  const handleSelectAnswer = (key: string) => {
    if (isRevealed) return
    setSelectedAnswer(key)
  }

  const handleReveal = () => {
    if (!selectedAnswer) return
    setIsRevealed(true)
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectCount((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsRevealed(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsRevealed(false)
    setCorrectCount(0)
    setIsCompleted(false)
  }

  if (isCompleted) {
    const score = Math.round((correctCount / totalQuestions) * 100)
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-6">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className={cn(
                "mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6",
                score >= 70
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : score >= 50
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              )}
            >
              <span
                className={cn(
                  "text-3xl font-bold",
                  score >= 70
                    ? "text-emerald-600 dark:text-emerald-400"
                    : score >= 50
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {score}%
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {score >= 70 ? "Great job!" : score >= 50 ? "Good effort!" : "Keep practicing!"}
            </h2>
            <p className="text-muted-foreground mb-8">
              You got {correctCount} out of {totalQuestions} questions correct
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRestart} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Practice Again
              </Button>
              <Link to={`/dashboard/topics/math/${topic}`}>
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Learn More Tricks
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 pb-24 md:pb-6">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Link to="/dashboard/practice">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">
                Quick Practice
              </h1>
              <p className="text-sm text-muted-foreground">
                {topicNames[topic] || topic}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-foreground">
                {currentIndex + 1}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar
            value={currentIndex + 1}
            max={totalQuestions}
            size="sm"
          />
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Question */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Target className="h-4 w-4" />
                </div>
                <p className="text-base font-medium text-foreground leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>

              {/* Pattern badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                {currentQuestion.patternName}
              </span>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option.key
                const isCorrect = option.key === currentQuestion.correctAnswer

                return (
                  <motion.button
                    key={option.key}
                    onClick={() => handleSelectAnswer(option.key)}
                    disabled={isRevealed}
                    className={cn(
                      "flex items-center gap-3 w-full rounded-xl border px-4 py-4 text-left transition-all",
                      !isRevealed &&
                        "hover:bg-accent/50 hover:border-primary/30 cursor-pointer",
                      isSelected && !isRevealed && "border-primary bg-primary/5",
                      isRevealed && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
                      isRevealed && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20"
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={!isRevealed ? { scale: 0.99 } : {}}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all shrink-0",
                        isRevealed && isCorrect && "border-emerald-500 bg-emerald-500 text-white",
                        isRevealed && isSelected && !isCorrect && "border-red-500 bg-red-500 text-white",
                        !isRevealed && isSelected && "border-primary bg-primary text-primary-foreground",
                        !isRevealed && !isSelected && "border-border"
                      )}
                    >
                      {isRevealed && isCorrect ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isRevealed && isSelected && !isCorrect ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        option.key.toUpperCase()
                      )}
                    </span>
                    <span className="font-medium text-foreground">{option.text}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {isRevealed && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border bg-muted/50 p-4"
                >
                  <p className="text-sm font-medium text-foreground mb-1">
                    Explanation:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <div className="flex justify-end">
              {!isRevealed ? (
                <Button
                  onClick={handleReveal}
                  disabled={!selectedAnswer}
                  className="gap-2"
                >
                  Check Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  {currentIndex < totalQuestions - 1 ? (
                    <>
                      Next Question
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    "See Results"
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
