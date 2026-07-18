"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

type LoaderStage = "boot" | "loading" | "ready" | "entering"

export function CinematicLoader() {
  const [visible, setVisible] = useState(true)
  const [stage, setStage] = useState<LoaderStage>("boot")
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }
    return false
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return
    
    // Cinematic boot sequence: boot -> loading -> ready -> entering -> hide
    const bootTimer = setTimeout(() => setStage("loading"), 600)
    const readyTimer = setTimeout(() => setStage("ready"), 1800)
    const enterTimer = setTimeout(() => setStage("entering"), 2400)
    const hideTimer = setTimeout(() => setVisible(false), 3100)
    return () => {
      clearTimeout(bootTimer)
      clearTimeout(readyTimer)
      clearTimeout(enterTimer)
      clearTimeout(hideTimer)
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) {
    return null
  }

  const stageText = {
    boot: "Initializing",
    loading: "Loading Experience",
    ready: "Experience Ready",
    entering: "Entering",
  }[stage]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "#08080f" }}
        >
          {/* Boot screen - terminal text at start */}
          {stage === "boot" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute top-12 left-12 font-mono text-xs text-primary/70"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="leading-relaxed"
              >
                {"> booting portfolio.exe"}<br/>
                {"> loading modules..."}
              </motion.p>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-10"
          >
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe, #fbbf24)",
                boxShadow: "0 0 50px rgba(108,92,231,0.4), 0 0 100px rgba(108,92,231,0.15)",
              }}
            >
              <span className="text-3xl font-bold text-white">KR</span>
            </div>
            <motion.div
              className="absolute -inset-3 rounded-3xl"
              style={{ border: "1px solid rgba(108,92,231,0.25)" }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.25, 0.7, 0.25],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -inset-5 rounded-[2rem]"
              style={{ border: "1px solid rgba(251,191,36,0.15)" }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm font-medium tracking-[0.3em] uppercase mb-8"
            style={{ color: "#7878a0" }}
          >
            {stageText}
          </motion.p>

          <div
            className="w-48 h-[2px] rounded-full overflow-hidden"
            style={{ background: "#1e1e42" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #6c5ce7, #a29bfe, #fbbf24)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: stage === "entering" ? "100%" : stage === "ready" ? "95%" : "70%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === "ready" || stage === "entering" ? 0 : 1 }}
            className="flex gap-2 mt-6"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#6c5ce7" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
          
          {stage === "entering" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-12 text-xs tracking-widest uppercase text-primary/50"
            >
              Welcome
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
