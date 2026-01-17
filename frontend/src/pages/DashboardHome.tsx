"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Sparkles,
  Flame,
  Target,
  Trophy,
  Clock,
  BookOpen,
  ChevronRight,
  Zap,
  Brain,
  Calendar,
  Star,
  Play,
  Award,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { JeetFace } from "@/components/jeet-face"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 25 }
  }
}

// Mock data - replace with real data later
const userData = {
  name: "Rahul",
  streak: 7,
  xp: 2450,
  level: 12,
  questionsToday: 15,
  dailyGoal: 20,
  accuracy: 78,
  totalQuestions: 342,
  tricksLearned: 45,
  hoursSpent: 28,
  rank: 156,
  examDate: new Date("2025-03-15"),
}

const weakTopics = [
  { name: "Profit & Loss", progress: 35, color: "from-red-500 to-orange-500" },
  { name: "Time & Work", progress: 42, color: "from-orange-500 to-amber-500" },
  { name: "Percentages", progress: 58, color: "from-amber-500 to-yellow-500" },
]

const recentActivity = [
  { type: "practice", topic: "Simple Interest", questions: 10, accuracy: 80, time: "2 hours ago" },
  { type: "trick", name: "Successive Percentage", time: "Yesterday" },
  { type: "practice", topic: "Ratio & Proportion", questions: 15, accuracy: 73, time: "Yesterday" },
]

const leaderboard = [
  { rank: 1, name: "Priya S.", xp: 5420, avatar: "P" },
  { rank: 2, name: "Amit K.", xp: 4890, avatar: "A" },
  { rank: 3, name: "Sneha R.", xp: 4560, avatar: "S" },
]

const dailyChallenge = {
  title: "Speed Challenge",
  description: "Solve 5 percentage problems in under 3 minutes",
  reward: 50,
  completed: false,
}

export function DashboardHome() {
  const daysUntilExam = Math.ceil((userData.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const progressPercent = (userData.questionsToday / userData.dailyGoal) * 100
  const greeting = getGreeting()

  return (
    <div className="flex-1 overflow-y-auto chat-scroll">
      <motion.div
        className="w-full p-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-8">
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <JeetFace size={64} className="shadow-2xl" />
                </motion.div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">
                    {greeting}, {userData.name}! 👋
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Ready to crack some tricks today?
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/dashboard/ask">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="shadow-lg gap-2 font-semibold">
                      <Sparkles className="h-5 w-5" />
                      Ask Jeet
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="gap-2">
                    <Play className="h-5 w-5" />
                    Quick Practice
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <QuickStat icon={Flame} label="Day Streak" value={userData.streak} suffix="days" color="text-orange-500" />
              <QuickStat icon={Zap} label="Total XP" value={userData.xp.toLocaleString()} color="text-yellow-500" />
              <QuickStat icon={Target} label="Accuracy" value={userData.accuracy} suffix="%" color="text-green-500" />
              <QuickStat icon={Brain} label="Tricks Learned" value={userData.tricksLearned} color="text-pink-500" />
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2 cols wide */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Progress & Goal */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Today's Progress
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {userData.questionsToday} of {userData.dailyGoal} questions completed
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary">{Math.round(progressPercent)}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  {/* Goal marker */}
                  <div className="absolute inset-y-0 right-0 w-1 bg-primary/30" />
                </div>

                {/* Milestones */}
                <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                  <span>0</span>
                  <span className="text-amber-500 font-medium">🎯 {userData.dailyGoal} Goal</span>
                </div>
              </div>
            </motion.div>

            {/* Daily Challenge */}
            <motion.div variants={itemVariants}>
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-amber-500/10">
                        <Zap className="h-5 w-5 text-amber-500" />
                      </div>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        Daily Challenge
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-card-foreground">{dailyChallenge.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{dailyChallenge.description}</p>

                    <div className="flex items-center gap-4 mt-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                          <Play className="h-4 w-4" />
                          Start Challenge
                        </Button>
                      </motion.div>
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-semibold">+{dailyChallenge.reward} XP</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block text-6xl">🏆</div>
                </div>
              </div>
            </motion.div>

            {/* Weak Areas */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Needs Attention
                  </h2>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View All <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {weakTopics.map((topic, index) => (
                    <motion.div
                      key={topic.name}
                      className="group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{topic.name}</span>
                        <span className="text-xs text-muted-foreground">{topic.progress}% mastered</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", topic.color)}
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.progress}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                        />
                      </div>
                      <motion.div
                        className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={false}
                      >
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                          <Play className="h-3 w-3" /> Practice Now
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Recent Activity
                  </h2>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View All <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        activity.type === "practice" ? "bg-blue-500/10" : "bg-violet-500/10"
                      )}>
                        {activity.type === "practice" ? (
                          <BookOpen className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-violet-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {activity.type === "practice" ? activity.topic : activity.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.type === "practice"
                            ? `${activity.questions} questions • ${activity.accuracy}% accuracy`
                            : "New trick learned"
                          }
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Exam Countdown */}
            <motion.div variants={scaleIn}>
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
                <div className="relative text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4">
                    <Calendar className="h-3 w-3" />
                    SSC CGL 2025
                  </div>

                  <motion.div
                    className="text-5xl font-bold text-rose-600 dark:text-rose-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                  >
                    {daysUntilExam}
                  </motion.div>
                  <p className="text-sm text-muted-foreground mt-1">days remaining</p>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {userData.examDate.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Streak Card */}
            <motion.div variants={scaleIn}>
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2 text-card-foreground">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Streak
                  </h3>
                </div>

                <div className="flex items-end gap-2 mb-4">
                  <motion.span
                    className="text-4xl font-bold text-orange-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                  >
                    {userData.streak}
                  </motion.span>
                  <span className="text-muted-foreground mb-1">days</span>
                </div>

                {/* Month Heatmap */}
                <MonthHeatmap currentStreak={userData.streak} />
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Leaderboard
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View All <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <motion.div
                      key={user.rank}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 && "bg-yellow-500 text-white",
                        index === 1 && "bg-gray-400 text-white",
                        index === 2 && "bg-amber-600 text-white"
                      )}>
                        {user.rank}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {user.xp.toLocaleString()} XP
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Your rank */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {userData.rank}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {userData.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">You</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">
                      {userData.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Summary */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                  Your Stats
                </h3>

                <div className="space-y-4">
                  <StatRow icon={CheckCircle2} label="Questions Solved" value={userData.totalQuestions} color="text-emerald-500" />
                  <StatRow icon={Brain} label="Tricks Mastered" value={userData.tricksLearned} color="text-violet-500" />
                  <StatRow icon={Clock} label="Hours Practiced" value={userData.hoursSpent} color="text-blue-500" />
                  <StatRow icon={Award} label="Current Level" value={userData.level} color="text-amber-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Helper Components
function QuickStat({
  icon: Icon,
  label,
  value,
  suffix = "",
  color
}: {
  icon: React.ElementType
  label: string
  value: string | number
  suffix?: string
  color: string
}) {
  return (
    <motion.div
      className="bg-muted/50 rounded-xl p-4 border border-border/50"
      whileHover={{ scale: 1.02, backgroundColor: "var(--muted)" }}
    >
      <Icon className={cn("h-5 w-5 mb-2", color)} />
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-card-foreground">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  )
}

function StatRow({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function MonthHeatmap({ currentStreak }: { currentStreak: number }) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const todayDate = today.getDate()

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDay.getDate()
  const firstDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Generate activity data for the month (mock data - replace with real data later)
  const getActivityLevel = (day: number): number => {
    if (day > todayDate) return 0 // Future days
    if (day === todayDate) return 4 // Today - highest intensity
    const daysAgo = todayDate - day
    if (daysAgo <= currentStreak) {
      // Within current streak - high intensity, decreasing slightly with distance
      if (daysAgo <= 3) return 4 // Last 3 days - highest
      if (daysAgo <= 7) return 3 // Week 1 - high
      return 2 // Rest of streak - medium
    }
    // Past streak days - some activity but less
    // Use a deterministic pattern based on day number for consistency
    const seed = day * 7 + currentYear
    const activity = seed % 3 // 0, 1, or 2
    return activity === 0 ? 0 : activity // 0 or 1-2
  }

  // Create array of days with activity levels
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return {
      day,
      activity: getActivityLevel(day),
      isToday: day === todayDate,
      isFuture: day > todayDate,
    }
  })

  // Get color based on activity level
  const getColor = (activity: number, isToday: boolean, isFuture: boolean) => {
    if (isFuture) return "bg-muted border border-border/50"
    if (isToday) return "bg-orange-500 border border-orange-600"
    if (activity === 0) return "bg-muted border border-border/50"
    if (activity === 1) return "bg-orange-200 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-800/50"
    if (activity === 2) return "bg-orange-300 dark:bg-orange-800/40 border border-orange-400 dark:border-orange-700/50"
    if (activity === 3) return "bg-orange-400 dark:bg-orange-700/50 border border-orange-500 dark:border-orange-600/50"
    return "bg-orange-500 border border-orange-600"
  }

  // Day names (short)
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <div className="space-y-2">
      {/* Month label */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span className="font-medium">
          {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded bg-muted border border-border/50" />
            <div className="w-2.5 h-2.5 rounded bg-orange-200 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-800/50" />
            <div className="w-2.5 h-2.5 rounded bg-orange-300 dark:bg-orange-800/40 border border-orange-400 dark:border-orange-700/50" />
            <div className="w-2.5 h-2.5 rounded bg-orange-400 dark:bg-orange-700/50 border border-orange-500 dark:border-orange-600/50" />
            <div className="w-2.5 h-2.5 rounded bg-orange-500 border border-orange-600" />
          </div>
          <span className="text-muted-foreground">More</span>
        </div>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((name, idx) => (
          <div key={idx} className="text-center text-[10px] text-muted-foreground font-medium">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {days.map(({ day, activity, isToday, isFuture }) => (
          <motion.div
            key={day}
            className={cn(
              "aspect-square rounded-sm border transition-all cursor-pointer group relative",
              getColor(activity, isToday, isFuture)
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + (day - 1) * 0.01 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            title={
              isFuture
                ? `${day} (Future)`
                : isToday
                ? `Today - ${activity} questions`
                : `${day} - ${activity} questions`
            }
          >
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
              {isToday
                ? `Today - ${activity} questions`
                : isFuture
                ? `${day} (Future)`
                : `${day} - ${activity} questions`}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
