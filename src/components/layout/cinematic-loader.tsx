"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

type LoaderStage = "boot" | "loading" | "ready" | "entering"

export function CinematicLoader() {
  const [visible, setVisible] = useState(true)
  const [stage, setStage] = useState<LoaderStage>("loading")

  useEffect(() => {
    const readyTimer = setTimeout(() => setStage("ready"), 1200)
    const enterTimer = setTimeout(() => setStage("entering"), 1800)
    const hideTimer = setTimeout(() => setVisible(false), 2400)
    return () => {
      clearTimeout(readyTimer)
      clearTimeout(enterTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  const stageText = {
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
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8 sm:mb-10"
          >
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe, #fbbf24)",
                boxShadow: "0 0 50px rgba(108,92,231,0.4), 0 0 100px rgba(108,92,231,0.15)",
              }}
            >
              <span className="text-2xl sm:text-3xl font-bold text-white">KR</span>
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
            className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase mb-6 sm:mb-8"
            style={{ color: "#7878a0" }}
          >
            {stageText}
          </motion.p>

          <div
            className="w-40 sm:w-48 h-[2px] rounded-full overflow-hidden"
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
            className="flex gap-2 mt-5 sm:mt-6"
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
              className="absolute bottom-8 sm:bottom-12 text-xs tracking-widest uppercase text-primary/50"
            >
              Welcome
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
