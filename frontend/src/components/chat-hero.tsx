"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Percent, TrendingUp, Scale, Clock, Sparkles, ArrowRight, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { JeetFace } from "./jeet-face"
import { Button } from "./ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

interface TopicChip {
  id: string
  label: string
  icon: React.ElementType
  color: string
  prompt: string
  topicPath: string
}

const topics: TopicChip[] = [
  {
    id: "percentage",
    label: "Percentage",
    icon: Percent,
    color: "topic-chip-percentage",
    prompt: "If 20% of A = 30% of B, then A:B = ?",
    topicPath: "/dashboard/topics/math/percentage",
  },
  {
    id: "profit",
    label: "Profit & Loss",
    icon: TrendingUp,
    color: "topic-chip-profit",
    prompt: "A sells an article to B at 20% profit, B sells to C at 10% profit. If C pays Rs 264, find cost price of A.",
    topicPath: "/dashboard/topics/math/profit-loss",
  },
  {
    id: "ratio",
    label: "Ratio",
    icon: Scale,
    color: "topic-chip-ratio",
    prompt: "If A:B = 2:3 and B:C = 4:5, then find A:B:C",
    topicPath: "/dashboard/topics/math/ratio-proportion",
  },
  {
    id: "time",
    label: "Time & Work",
    icon: Clock,
    color: "topic-chip-time",
    prompt: "A can do a work in 10 days, B in 15 days. In how many days will they finish together?",
    topicPath: "/dashboard/topics/math/time-work",
  },
]

const greetings = [
  "Kaunsa topic crack karna hai aaj?",
  "Aaj kya sikhe? Pick a topic!",
  "Ready to learn some tricks?",
  "Choose your challenge!",
]

interface ChatHeroProps {
  onTopicSelect: (prompt: string) => void
  focusMode?: boolean
}

export function ChatHero({ onTopicSelect, focusMode = false }: ChatHeroProps) {
  const isMobile = useIsMobile()
  const [greeting] = React.useState(() =>
    greetings[Math.floor(Math.random() * greetings.length)]
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
  }

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-center px-4 py-6 sm:px-6 sm:py-12",
        !focusMode && "hero-pattern"
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating decorative elements - hidden in focus mode */}
      {!focusMode && (
        <>
          <motion.div
            className="absolute top-20 left-[15%] text-4xl opacity-20 float-slow pointer-events-none select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 0.5 }}
          >
            %
          </motion.div>
          <motion.div
            className="absolute top-32 right-[20%] text-3xl opacity-15 float-medium pointer-events-none select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 0.7 }}
          >
            ÷
          </motion.div>
          <motion.div
            className="absolute bottom-32 left-[25%] text-2xl opacity-20 float-fast pointer-events-none select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 0.9 }}
          >
            ×
          </motion.div>
          <motion.div
            className="absolute bottom-40 right-[15%] text-3xl opacity-15 float-slow pointer-events-none select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 1.1 }}
          >
            √
          </motion.div>
        </>
      )}

      {/* Jeet Mascot */}
      <motion.div
        className="relative mb-3 sm:mb-6"
        variants={itemVariants}
      >
        {!focusMode && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--jeet-primary)] to-[var(--jeet-secondary)] opacity-20 blur-2xl scale-150"
            animate={{
              scale: [1.5, 1.7, 1.5],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        <JeetFace
          size={isMobile ? (focusMode ? 48 : 64) : (focusMode ? 72 : 96)}
          className={cn(!focusMode && "jeet-glow")}
          isGreeting={!focusMode}
        />
      </motion.div>

      {/* Greeting text */}
      <motion.div
        className="mb-1 sm:mb-2"
        variants={itemVariants}
      >
        <span className="text-2xl sm:text-3xl wave-hand inline-block mr-1 sm:mr-2">👋</span>
        <span
          className="text-xl sm:text-2xl font-semibold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Hey!
        </span>
      </motion.div>

      <motion.p
        className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-8 max-w-md"
        variants={itemVariants}
      >
        {greeting}
      </motion.p>

      {/* Topic chips */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-8 max-w-2xl"
        variants={containerVariants}
      >
        {topics.map((topic) => {
          const Icon = topic.icon
          return (
            <motion.button
              key={topic.id}
              className={cn("topic-chip", topic.color)}
              variants={chipVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTopicSelect(topic.prompt)}
            >
              <Icon className="h-4 w-4" />
              <span>{topic.label}</span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Helper text with sparkle */}
      <motion.div
        className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6"
        variants={itemVariants}
      >
        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[var(--accent)]" />
        <span>Ya seedha apna question type karo</span>
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </motion.div>

      {/* Start Practice CTA */}
      {!focusMode && (
        <motion.div variants={itemVariants}>
          <Link to="/dashboard/practice">
            <Button
              variant="outline"
              className="gap-2 rounded-full"
            >
              <Target className="h-4 w-4" />
              Start Practice
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}
