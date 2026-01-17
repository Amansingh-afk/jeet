"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface JeetFaceProps {
  size?: number
  className?: string
  isThinking?: boolean
}

export function JeetFace({ size = 32, className, isThinking = false }: JeetFaceProps) {
  const faceRef = React.useRef<HTMLDivElement>(null)
  const [eyeOffset, setEyeOffset] = React.useState({ x: 0, y: 0 })

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

  return (
    <motion.div
      ref={faceRef}
      className={cn(
        "relative rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg",
        className
      )}
      style={{ width: size, height: size }}
      animate={isThinking ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: isThinking ? Infinity : 0 }}
    >
      {/* Face shadow/glow */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 opacity-50 blur-sm"
        style={{ transform: "scale(1.1)" }}
      />

      {/* Eyes container */}
      <div className="relative flex items-center gap-[2px]" style={{ gap: eyeSpacing }}>
        {/* Left eye */}
        <div
          className="relative rounded-full bg-white shadow-inner"
          style={{ width: eyeSize, height: eyeSize }}
        >
          <motion.div
            className="absolute rounded-full bg-gray-900"
            style={{
              width: pupilSize,
              height: pupilSize,
              left: "50%",
              top: "50%",
              marginLeft: -pupilSize / 2,
              marginTop: -pupilSize / 2,
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
                width: pupilSize * 0.3,
                height: pupilSize * 0.3,
                top: pupilSize * 0.15,
                left: pupilSize * 0.15,
              }}
            />
          </motion.div>
        </div>

        {/* Right eye */}
        <div
          className="relative rounded-full bg-white shadow-inner"
          style={{ width: eyeSize, height: eyeSize }}
        >
          <motion.div
            className="absolute rounded-full bg-gray-900"
            style={{
              width: pupilSize,
              height: pupilSize,
              left: "50%",
              top: "50%",
              marginLeft: -pupilSize / 2,
              marginTop: -pupilSize / 2,
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
                width: pupilSize * 0.3,
                height: pupilSize * 0.3,
                top: pupilSize * 0.15,
                left: pupilSize * 0.15,
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Blinking animation overlay - optional blink effect */}
      <motion.div
        className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
      >
        <div className="flex items-center" style={{ gap: eyeSpacing }}>
          <div
            className="rounded-full bg-gradient-to-br from-violet-500 to-indigo-600"
            style={{ width: eyeSize, height: eyeSize * 0.15 }}
          />
          <div
            className="rounded-full bg-gradient-to-br from-violet-500 to-indigo-600"
            style={{ width: eyeSize, height: eyeSize * 0.15 }}
          />
        </div>
      </motion.div>

      {/* Subtle shine */}
      <div
        className="absolute rounded-full bg-white/20"
        style={{
          width: size * 0.3,
          height: size * 0.15,
          top: size * 0.1,
          left: size * 0.15,
          transform: "rotate(-20deg)",
        }}
      />
    </motion.div>
  )
}
