"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface JeetFaceProps {
  size?: number
  className?: string
  isThinking?: boolean
  isGreeting?: boolean
  mood?: "neutral" | "happy" | "excited" | "focused"
}

export function JeetFace({ 
  size = 32, 
  className, 
  isThinking = false,
  isGreeting = false,
  mood = "neutral"
}: JeetFaceProps) {
  const faceRef = React.useRef<HTMLDivElement>(null)
  const [eyeOffset, setEyeOffset] = React.useState({ x: 0, y: 0 })
  const [hasGreeted, setHasGreeted] = React.useState(false)

  React.useEffect(() => {
    if (isGreeting && !hasGreeted) {
      setHasGreeted(true)
    }
  }, [isGreeting, hasGreeted])

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!faceRef.current) return

      const face = faceRef.current.getBoundingClientRect()
      const faceCenterX = face.left + face.width / 2
      const faceCenterY = face.top + face.height / 2

      // Calculate angle from face center to mouse
      const deltaX = e.clientX - faceCenterX
      const deltaY = e.clientY - faceCenterY

      // Calculate distance (capped)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxOffset = size * 0.08 // Max pupil movement

      // Normalize and scale
      if (distance > 0) {
        const scale = Math.min(distance / 100, 1) * maxOffset
        setEyeOffset({
          x: (deltaX / distance) * scale,
          y: (deltaY / distance) * scale,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [size])

  const eyeSize = size * 0.28
  const pupilSize = eyeSize * 0.5
  const eyeSpacing = size * 0.15
  const mouthWidth = size * 0.3
  const mouthHeight = size * 0.08
  
  // Mood-based eye adjustments
  const eyeSquish = mood === "happy" || mood === "excited" ? 0.85 : 1
  const pupilScale = mood === "excited" ? 1.15 : mood === "focused" ? 0.9 : 1

  // Greeting bounce animation
  const greetingAnimation = isGreeting ? {
    y: [0, -8, 0, -4, 0],
    rotate: [0, -5, 5, -3, 0],
  } : {}

  return (
    <motion.div
      ref={faceRef}
      className={cn(
        "relative rounded-full flex items-center justify-center shadow-lg",
        "bg-gradient-to-br from-[var(--jeet-primary)] to-[var(--jeet-secondary)]",
        className
      )}
      style={{ width: size, height: size }}
      initial={isGreeting ? { scale: 0.5, opacity: 0 } : false}
      animate={{
        scale: isThinking ? [1, 1.05, 1] : 1,
        opacity: 1,
        ...greetingAnimation,
      }}
      transition={{ 
        duration: isGreeting ? 0.8 : 2, 
        repeat: isThinking ? Infinity : 0,
        ease: isGreeting ? [0.68, -0.55, 0.265, 1.55] : "easeInOut",
      }}
    >
      {/* Face shadow/glow - enhanced for larger sizes */}
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-sm"
        style={{ 
          transform: "scale(1.1)",
          background: "linear-gradient(135deg, var(--jeet-primary), var(--jeet-secondary))",
        }}
      />

      {/* Excited sparkle effects */}
      {mood === "excited" && (
        <>
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-white"
            style={{ top: -4, right: size * 0.2 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-white"
            style={{ top: size * 0.1, left: -2 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {/* Eyes container */}
      <div className="relative flex items-center" style={{ gap: eyeSpacing }}>
        {/* Left eye */}
        <motion.div
          className="relative rounded-full bg-white shadow-inner overflow-hidden"
          style={{ 
            width: eyeSize, 
            height: eyeSize * eyeSquish,
          }}
          animate={mood === "happy" ? { scaleY: [1, 0.85, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute rounded-full bg-gray-900"
            style={{
              width: pupilSize * pupilScale,
              height: pupilSize * pupilScale,
              left: "50%",
              top: "50%",
              marginLeft: (-pupilSize * pupilScale) / 2,
              marginTop: (-pupilSize * pupilScale) / 2,
            }}
            animate={{
              x: eyeOffset.x,
              y: eyeOffset.y,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {/* Pupil highlight */}
            <div
              className="absolute rounded-full bg-white"
              style={{
                width: pupilSize * pupilScale * 0.3,
                height: pupilSize * pupilScale * 0.3,
                top: pupilSize * pupilScale * 0.12,
                left: pupilSize * pupilScale * 0.12,
              }}
            />
          </motion.div>
        </motion.div>

        {/* Right eye */}
        <motion.div
          className="relative rounded-full bg-white shadow-inner overflow-hidden"
          style={{ 
            width: eyeSize, 
            height: eyeSize * eyeSquish,
          }}
          animate={mood === "happy" ? { scaleY: [1, 0.85, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute rounded-full bg-gray-900"
            style={{
              width: pupilSize * pupilScale,
              height: pupilSize * pupilScale,
              left: "50%",
              top: "50%",
              marginLeft: (-pupilSize * pupilScale) / 2,
              marginTop: (-pupilSize * pupilScale) / 2,
            }}
            animate={{
              x: eyeOffset.x,
              y: eyeOffset.y,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {/* Pupil highlight */}
            <div
              className="absolute rounded-full bg-white"
              style={{
                width: pupilSize * pupilScale * 0.3,
                height: pupilSize * pupilScale * 0.3,
                top: pupilSize * pupilScale * 0.12,
                left: pupilSize * pupilScale * 0.12,
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Mouth - shown for larger sizes and happy/excited moods */}
      {size >= 48 && (mood === "happy" || mood === "excited") && (
        <motion.div
          className="absolute bg-white/90 rounded-full"
          style={{
            width: mouthWidth,
            height: mood === "excited" ? mouthHeight * 1.5 : mouthHeight,
            bottom: size * 0.18,
            left: "50%",
            marginLeft: -mouthWidth / 2,
            borderRadius: mood === "excited" ? "0 0 50% 50%" : "50%",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
        />
      )}

      {/* Blinking animation overlay */}
      <motion.div
        className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
      >
        <div className="flex items-center" style={{ gap: eyeSpacing }}>
          <div
            className="rounded-full"
            style={{ 
              width: eyeSize, 
              height: eyeSize * 0.15,
              background: "linear-gradient(135deg, var(--jeet-primary), var(--jeet-secondary))",
            }}
          />
          <div
            className="rounded-full"
            style={{ 
              width: eyeSize, 
              height: eyeSize * 0.15,
              background: "linear-gradient(135deg, var(--jeet-primary), var(--jeet-secondary))",
            }}
          />
        </div>
      </motion.div>

      {/* Subtle shine */}
      <div
        className="absolute rounded-full bg-white/25"
        style={{
          width: size * 0.3,
          height: size * 0.15,
          top: size * 0.1,
          left: size * 0.15,
          transform: "rotate(-20deg)",
        }}
      />

      {/* Secondary shine for larger sizes */}
      {size >= 64 && (
        <div
          className="absolute rounded-full bg-white/15"
          style={{
            width: size * 0.15,
            height: size * 0.08,
            top: size * 0.22,
            left: size * 0.55,
            transform: "rotate(-20deg)",
          }}
        />
      )}
    </motion.div>
  )
}
