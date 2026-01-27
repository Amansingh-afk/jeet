"use client"

import { motion } from "framer-motion"
import { Calculator, Brain, Languages, Globe } from "lucide-react"
import { SubjectCard } from "@/components/subject-card"

const subjects = [
  {
    id: "math",
    name: "Math",
    icon: Calculator,
    topicCount: 30,
    color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    disabled: false,
  },
  {
    id: "reasoning",
    name: "Reasoning",
    icon: Brain,
    topicCount: 0,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    disabled: true,
  },
  {
    id: "english",
    name: "English",
    icon: Languages,
    topicCount: 0,
    color: "bg-gradient-to-br from-emerald-500 to-teal-500",
    disabled: true,
  },
  {
    id: "gk",
    name: "GK",
    icon: Globe,
    topicCount: 0,
    color: "bg-gradient-to-br from-amber-500 to-orange-500",
    disabled: true,
  },
]

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

export function Topics() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Topics</h1>
          <p className="text-muted-foreground mt-1">
            Choose a subject to explore tricks
          </p>
        </motion.div>

        {/* Subject Grid */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {subjects.map((subject) => (
            <motion.div key={subject.id} variants={itemVariants}>
              <SubjectCard
                id={subject.id}
                name={subject.name}
                icon={subject.icon}
                topicCount={subject.topicCount}
                color={subject.color}
                disabled={subject.disabled}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
