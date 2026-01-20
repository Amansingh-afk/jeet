"use client"

import * as React from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import remarkGfm from "remark-gfm"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

/**
 * Convert LaTeX delimiters from \[...\] and \(...\) to $$...$$ and $...$
 * for compatibility with remark-math
 */
function preprocessLatex(content: string): string {
  if (!content) return content

  // Convert display math: \[...\] -> $$...$$
  let processed = content.replace(/\\\[([\s\S]*?)\\\]/g, '\n$$\n$1\n$$\n')

  // Convert inline math: \(...\) -> $...$
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')

  return processed
}

import {
  Send,
  Sparkles,
  Zap,
  BookOpen,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Video,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExcalidrawViewer } from "@/components/excalidraw-viewer"
import { renderTemplate } from "@/services/template"
import { JeetFace } from "@/components/jeet-face"
import { ChatHero } from "@/components/chat-hero"
import { FocusModeToggle } from "@/components/focus-mode-toggle"
import { streamChat, type TeachingLevel, type PatternInfo, type DiagramInfo } from "@/services/chat"

// Types
interface MCQOption {
  key: string
  text: string
}

interface SolutionStep {
  step: number
  action: string
  example?: string
}

interface Message {
  id: string
  type: "user" | "ai" | "system" | "error"
  content: string
  timestamp: Date
  isStreaming?: boolean
  thinkingText?: string
  pattern?: {
    id: string
    name: string
    confidence?: number
    matchedVia?: "question" | "pattern"
  }
  mcq?: {
    options: MCQOption[]
    correct: string
    userAnswer?: string
    revealed: boolean
  }
  trick?: {
    name: string
    oneLiner: string
    steps: SolutionStep[]
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  diagram?: any[]
  diagramInfo?: DiagramInfo
  answer?: string
  timeTarget?: string
  level?: TeachingLevel
  alternatives?: Array<{
    pattern_id: string
    name: string
    similarity: number
  }>
}

// Animation variants
const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15 }
  }
}

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  }
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, x: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: "spring", stiffness: 500, damping: 25 }
  }
}

// Level config - EdTech styled
const levelConfig = {
  instant: {
    label: "Quick",
    icon: Zap,
    description: "30s solve",
    color: "from-[var(--topic-percentage)] to-emerald-500",
    bg: "bg-[var(--topic-percentage)]/10 hover:bg-[var(--topic-percentage)]/20",
    text: "text-[var(--topic-percentage)]",
    border: "border-[var(--topic-percentage)]/30"
  },
  shortcut: {
    label: "Normal",
    icon: Lightbulb,
    description: "2 min",
    color: "from-[var(--topic-profit)] to-amber-500",
    bg: "bg-[var(--topic-profit)]/10 hover:bg-[var(--topic-profit)]/20",
    text: "text-[var(--topic-profit)]",
    border: "border-[var(--topic-profit)]/30"
  },
  deep: {
    label: "Detailed",
    icon: BookOpen,
    description: "5 min",
    color: "from-[var(--topic-ratio)] to-indigo-500",
    bg: "bg-[var(--topic-ratio)]/10 hover:bg-[var(--topic-ratio)]/20",
    text: "text-[var(--topic-ratio)]",
    border: "border-[var(--topic-ratio)]/30"
  }
}

// Quick follow-up prompts
const followUpPrompts = [
  { label: "Similar Question", icon: MessageSquare },
  { label: "Harder Version", icon: Zap },
  { label: "Watch Video", icon: Video },
]

export function AskJeet() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [currentLevel, setCurrentLevel] = React.useState<TeachingLevel>("shortcut")
  const [isFocused, setIsFocused] = React.useState(false)
  const [focusMode, setFocusMode] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const isEmptyState = messages.length === 0

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [input])

  const handleTopicSelect = (prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    const aiMessageId = (Date.now() + 1).toString()

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        type: "ai",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
        level: currentLevel,
      },
    ])

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      await streamChat(
        { message: input, context: { level: currentLevel } },
        {
          onThinking: (thinkingText) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, thinkingText } : msg
              )
            )
          },
          onPattern: (pattern: PatternInfo) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      pattern: {
                        id: pattern.pattern_id,
                        name: pattern.pattern_name,
                        confidence: pattern.confidence,
                        matchedVia: pattern.matched_via,
                      },
                      thinkingText: undefined,
                    }
                  : msg
              )
            )
          },
          onContent: (content) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: msg.content + content }
                  : msg
              )
            )
          },
          onDiagram: async (diagramInfo: DiagramInfo) => {
            if (diagramInfo.template_id) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? { ...msg, diagramInfo }
                    : msg
                )
              )

              try {
                const rendered = await renderTemplate(
                  diagramInfo.template_id,
                  diagramInfo.params || {}
                )
                if (rendered?.elements) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? { ...msg, diagram: rendered.elements }
                        : msg
                    )
                  )
                }
              } catch (error) {
                console.error('Failed to render template:', error)
              }
            }
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
              )
            )
            setIsLoading(false)
          },
          onError: (error, alternatives) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      type: "error" as const,
                      content: error,
                      alternatives,
                      isStreaming: false,
                    }
                  : msg
              )
            )
            setIsLoading(false)
          },
        },
        abortControllerRef.current.signal
      )
    } catch (error) {
      if ((error as Error).name === "AbortError") return
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                type: "error" as const,
                content: "Connection error. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      )
      setIsLoading(false)
    }
  }

  const handleRetryWithPattern = async (patternId: string) => {
    const lastUserMessage = [...messages].reverse().find((m) => m.type === "user")
    if (!lastUserMessage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: lastUserMessage.content,
      timestamp: new Date(),
    }

    const aiMessageId = (Date.now() + 1).toString()

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        type: "ai",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
        level: currentLevel,
      },
    ])

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      await streamChat(
        { message: lastUserMessage.content, context: { level: currentLevel, pattern_id: patternId } },
        {
          onThinking: (thinkingText) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, thinkingText } : msg
              )
            )
          },
          onPattern: (pattern: PatternInfo) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      pattern: {
                        id: pattern.pattern_id,
                        name: pattern.pattern_name,
                        confidence: pattern.confidence,
                        matchedVia: pattern.matched_via,
                      },
                      thinkingText: undefined,
                    }
                  : msg
              )
            )
          },
          onContent: (content) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: msg.content + content }
                  : msg
              )
            )
          },
          onDiagram: async (diagramInfo: DiagramInfo) => {
            if (diagramInfo.template_id) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? { ...msg, diagramInfo }
                    : msg
                )
              )

              try {
                const rendered = await renderTemplate(
                  diagramInfo.template_id,
                  diagramInfo.params || {}
                )
                if (rendered?.elements) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? { ...msg, diagram: rendered.elements }
                        : msg
                    )
                  )
                }
              } catch (error) {
                console.error('Failed to render template:', error)
              }
            }
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
              )
            )
            setIsLoading(false)
          },
          onError: (error, alternatives) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      type: "error" as const,
                      content: error,
                      alternatives,
                      isStreaming: false,
                    }
                  : msg
              )
            )
            setIsLoading(false)
          },
        },
        abortControllerRef.current.signal
      )
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  type: "error" as const,
                  content: "Connection error. Please try again.",
                  isStreaming: false,
                }
              : msg
          )
        )
        setIsLoading(false)
      }
    }
  }

  const handleMCQSelect = (messageId: string, selectedKey: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.mcq) {
          return {
            ...msg,
            mcq: {
              ...msg.mcq,
              userAnswer: selectedKey,
              revealed: true,
            },
          }
        }
        return msg
      })
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn(
      "flex h-full min-h-0 flex-col overflow-hidden transition-colors duration-500",
      focusMode ? "focus-mode bg-[var(--focus-bg)]" : "bg-background"
    )}>
      {/* Focus mode toggle - top right */}
      <motion.div 
        className="absolute top-4 right-4 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <FocusModeToggle 
          enabled={focusMode} 
          onToggle={setFocusMode}
          showTimer={true}
        />
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto chat-scroll">
        <div className={cn(
          "mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 flex flex-col",
          isEmptyState && "min-h-full justify-center"
        )}>
          {/* Hero Empty State */}
          <AnimatePresence mode="wait">
            {isEmptyState ? (
              <motion.div
                key="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ChatHero 
                  onTopicSelect={handleTopicSelect}
                  focusMode={focusMode}
                />
              </motion.div>
            ) : (
              <LayoutGroup>
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      layout
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="mb-6"
                    >
                      <MessageBubble
                        message={message}
                        onMCQSelect={handleMCQSelect}
                        onRetryWithPattern={handleRetryWithPattern}
                        isLast={index === messages.length - 1}
                        focusMode={focusMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </LayoutGroup>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Floating design */}
      <div className={cn(
        "flex-shrink-0 transition-all duration-300",
        isEmptyState ? "bg-transparent" : "border-t bg-gradient-to-t from-background via-background to-transparent backdrop-blur-xl"
      )}>
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-4">
          {/* Level Selector - Compact pills */}
          {!focusMode && (
            <motion.div
              className="flex items-center justify-center gap-1.5 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-xs font-medium text-muted-foreground mr-2 hidden sm:inline">
                Depth:
              </span>
              <div className="flex gap-1 p-1 rounded-full bg-muted/60 backdrop-blur-sm">
                {(["instant", "shortcut", "deep"] as TeachingLevel[]).map((level) => {
                  const config = levelConfig[level]
                  const isActive = currentLevel === level
                  const Icon = config.icon

                  return (
                    <motion.button
                      key={level}
                      onClick={() => setCurrentLevel(level)}
                      className={cn(
                        "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="levelIndicator"
                          className="absolute inset-0 rounded-full bg-background shadow-sm"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <Icon className="h-3.5 w-3.5 relative z-10" />
                      <span className="relative z-10 hidden sm:inline">{config.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Input Box - Floating pill design */}
          <motion.div
            className={cn(
              "relative rounded-2xl border bg-card transition-all duration-300 input-glow",
              isFocused 
                ? "shadow-lg border-primary/40" 
                : "shadow-md border-border hover:border-border/80",
              focusMode && "border-muted"
            )}
            layout
          >
            <div className="flex items-end gap-2 p-2 sm:p-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={focusMode 
                  ? "Type your question..." 
                  : "Apna question type karo... (e.g., If 20% of A = 30% of B, then A:B = ?)"
                }
                className={cn(
                  "flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed",
                  "placeholder:text-muted-foreground/50 focus:outline-none",
                  "min-h-[44px] max-h-[150px]",
                  focusMode && "text-base"
                )}
                rows={1}
                disabled={isLoading}
              />
              <motion.div
                whileHover={!isLoading && input.trim() ? { scale: 1.05 } : {}}
                whileTap={!isLoading && input.trim() ? { scale: 0.92 } : {}}
              >
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all duration-300",
                    input.trim() && !isLoading
                      ? "bg-primary shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Helper text */}
          {!focusMode && (
            <motion.p
              className="mt-3 text-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium border border-border/50">
                  Enter
                </kbd>
                <span className="text-muted-foreground/70">to send</span>
              </span>
              <span className="mx-2 text-border">•</span>
              <span className="text-muted-foreground/70">Hinglish mein bhi likh sakte ho</span>
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}

// Thinking Animation Component
function ThinkingIndicator({ text }: { text: string }) {
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--jeet-primary)] to-[var(--jeet-secondary)] opacity-30 blur-md"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <JeetFace size={28} isThinking mood="focused" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{text}</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Message Bubble Component
function MessageBubble({
  message,
  onMCQSelect,
  onRetryWithPattern,
  isLast,
  focusMode = false,
}: {
  message: Message
  onMCQSelect: (messageId: string, key: string) => void
  onRetryWithPattern?: (patternId: string) => void
  isLast?: boolean
  focusMode?: boolean
}) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <motion.div
          className="flex items-end gap-3 max-w-[85%] sm:max-w-[75%]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={cn(
            "rounded-2xl rounded-br-sm px-4 py-3 shadow-md",
            "bg-primary text-primary-foreground",
            focusMode ? "shadow-sm" : "shadow-primary/20"
          )}>
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </motion.div>
      </div>
    )
  }

  if (message.type === "error") {
    return (
      <motion.div
        className="flex justify-start"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="w-full max-w-[90%] sm:max-w-[80%] space-y-3">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-destructive leading-relaxed">{message.content}</p>

                {message.alternatives && message.alternatives.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Kya ye question similar hai?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.alternatives.map((alt) => (
                        <motion.button
                          key={alt.pattern_id}
                          onClick={() => onRetryWithPattern?.(alt.pattern_id)}
                          className="group flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition-all"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {alt.name}
                          <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // AI Message
  const levelCfg = message.level ? levelConfig[message.level] : levelConfig.shortcut

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[95%] sm:max-w-[85%] space-y-3">
        {/* AI Avatar & Name */}
        <div className="flex items-center gap-2.5">
          <JeetFace 
            size={36} 
            isThinking={message.isStreaming} 
            mood={message.isStreaming ? "focused" : "happy"}
            className={!focusMode ? "shadow-md" : ""}
          />
          <div className="flex items-center gap-2">
            <span 
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Jeet
            </span>
            {message.level && !focusMode && (
              <motion.span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  levelCfg.bg, levelCfg.text
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {levelCfg.label}
              </motion.span>
            )}
          </div>
        </div>

        {/* Thinking indicator */}
        <AnimatePresence>
          {message.thinkingText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ThinkingIndicator text={message.thinkingText} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pattern Badge */}
        <AnimatePresence>
          {message.pattern && !focusMode && (
            <motion.div
              className="flex items-center gap-2 flex-wrap"
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" />
                {message.pattern.name}
              </span>
              {message.pattern.confidence && (
                <motion.span
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[var(--success)] to-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${message.pattern.confidence * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    />
                  </div>
                  <span className="font-medium">{Math.round(message.pattern.confidence * 100)}%</span>
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Card */}
        {(message.content || message.isStreaming) && (
          <motion.div
            className={cn(
              "relative rounded-2xl border bg-card overflow-hidden",
              focusMode ? "shadow-sm border-muted" : "shadow-md"
            )}
            layout
          >
            {/* Accent top border */}
            {!focusMode && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-[var(--accent)] to-primary opacity-60" />
            )}

            <div className="p-4 sm:p-5">
              <motion.div
                className={cn(
                  "prose prose-sm dark:prose-invert max-w-none",
                  "prose-p:my-2 prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2 prose-headings:my-3",
                  "prose-strong:text-foreground prose-strong:font-semibold",
                  focusMode && "prose-base"
                )}
                variants={contentVariants}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => (
                      <p className="text-sm leading-relaxed">{children}</p>
                    ),
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="bg-muted/80 px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                          {children}
                        </code>
                      ) : (
                        <code className={className}>{children}</code>
                      )
                    },
                  }}
                >
                  {preprocessLatex(message.content)}
                </ReactMarkdown>
                {message.isStreaming && <span className="typing-cursor" />}
              </motion.div>

              {/* Diagram */}
              <AnimatePresence>
                {!message.isStreaming && message.diagram && (
                  <motion.div
                    className="mt-4 rounded-xl border bg-white dark:bg-gray-900 overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ExcalidrawViewer elements={message.diagram} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Actions */}
              <AnimatePresence>
                {!message.isStreaming && message.content && isLast && !focusMode && (
                  <motion.div
                    className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-border/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {followUpPrompts.map((prompt) => (
                      <motion.div 
                        key={prompt.label}
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs rounded-full gap-1.5 h-8 border-border/60 hover:border-primary/40 hover:bg-primary/5"
                        >
                          <prompt.icon className="h-3 w-3" />
                          {prompt.label}
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* MCQ Section */}
        <AnimatePresence>
          {message.mcq && (
            <motion.div
              className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm font-semibold">Pehle khud try karo:</p>
              <div className="grid gap-2">
                {message.mcq.options.map((option, index) => {
                  const isSelected = message.mcq?.userAnswer === option.key
                  const isCorrect = option.key === message.mcq?.correct
                  const isRevealed = message.mcq?.revealed

                  return (
                    <motion.button
                      key={option.key}
                      onClick={() => !isRevealed && onMCQSelect(message.id, option.key)}
                      disabled={isRevealed}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                        !isRevealed && "hover:bg-accent/50 hover:border-primary/30 cursor-pointer",
                        isRevealed && isCorrect && "border-[var(--success)] bg-[var(--success)]/10",
                        isRevealed && isSelected && !isCorrect && "border-destructive bg-destructive/10"
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={!isRevealed ? { scale: 1.01 } : {}}
                      whileTap={!isRevealed ? { scale: 0.99 } : {}}
                    >
                      <span className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                        isRevealed && isCorrect && "border-[var(--success)] bg-[var(--success)] text-white",
                        isRevealed && isSelected && !isCorrect && "border-destructive bg-destructive text-white",
                        !isRevealed && "border-border"
                      )}>
                        {isRevealed && isCorrect ? <CheckCircle2 className="h-4 w-4" /> :
                         isRevealed && isSelected && !isCorrect ? <XCircle className="h-4 w-4" /> :
                         option.key.toUpperCase()}
                      </span>
                      <span className="font-medium">{option.text}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solution Steps */}
        <AnimatePresence>
          {message.mcq?.revealed && message.trick && (
            <motion.div
              className="rounded-2xl border bg-card p-4 sm:p-5 space-y-4 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <h4 className="font-bold text-sm">{message.trick.name}</h4>
                <p className="text-sm text-muted-foreground italic mt-1">
                  "{message.trick.oneLiner}"
                </p>
              </div>

              <div className="space-y-3">
                {message.trick.steps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    className="flex gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                      {step.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{step.action}</p>
                      {step.example && (
                        <p className="text-sm text-muted-foreground font-mono mt-1 bg-muted/50 px-2 py-1 rounded">
                          {step.example}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {message.answer && (
                <motion.div
                  className="flex items-center justify-between rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20 px-4 py-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Answer
                    </p>
                    <p className="text-xl font-bold text-[var(--success)]">
                      {message.answer}
                    </p>
                  </div>
                  {message.timeTarget && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">{message.timeTarget}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
