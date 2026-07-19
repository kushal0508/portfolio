"use client"

import { useRef, useEffect, useMemo } from "react"
import { useScrollState, getCurrentSectionKey, SECTION_RANGES, type SectionKey } from "@/lib/scroll-provider"
import { cn } from "@/lib/utils"

export function CinematicHaze() {
  const {
    progress,
    smoothMouseX,
    smoothMouseY,
    fogR,
    fogG,
    fogB,
    accentR,
    accentG,
    accentB,
  } = useScrollState()

  const hazeRef = useRef<HTMLDivElement>(null)
  const vignetteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const haze = hazeRef.current
      if (haze) {
        const gx = 50 + smoothMouseX * 18
        const gy = 50 + smoothMouseY * 18
        haze.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(${Math.round(
          accentR * 255,
        )},${Math.round(accentG * 255)},${Math.round(accentB * 255)},0.06) 0%, rgba(${Math.round(
          fogR * 255,
        )},${Math.round(fogG * 255)},${Math.round(fogB * 255)},0.10) 28%, rgba(0,0,0,0) 70%)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [smoothMouseX, smoothMouseY, fogR, fogG, fogB, accentR, accentG, accentB])

  useEffect(() => {
    const v = vignetteRef.current
    if (v) {
      v.style.opacity = String(0.55 + Math.min(0.35, progress * 0.35))
    }
  }, [progress])

  return (
    <>
      <div
        ref={hazeRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10"
        style={{ opacity: 0.7, transition: "opacity 1.2s ease" }}
      />
      <div
        ref={vignetteRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[11]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.45) 82%, rgba(0,0,0,0.7) 100%)",
          opacity: 0.55,
          transition: "opacity 1.2s ease",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[12]"
        style={{
          background: `linear-gradient(180deg, rgba(${Math.round(
            accentR * 255,
          )},${Math.round(accentG * 255)},${Math.round(accentB * 255)},0.04) 0%, transparent 22%, transparent 78%, rgba(${Math.round(
            fogR * 255,
          )},${Math.round(fogG * 255)},${Math.round(fogB * 255)},0.05) 100%)`,
          transition: "background 1.2s ease",
        }}
      />
    </>
  )
}

export function JourneyCompass() {
  const { progress } = useScrollState()
  const current = getCurrentSectionKey(progress)
  const rafRef = useRef(0)
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () => {
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${progress})`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [progress])

  const scrollToSection = (section: SectionKey) => {
    const range = SECTION_RANGES.find((r) => r.key === section)
    if (range) {
      const target = (range.start + range.end) / 2
      window.scrollTo({ top: target * 8000, behavior: "smooth" })
    }
  }

  const scenes: SectionKey[] = useMemo(
    () => ["OPENING", "ABOUT", "SKILLS", "EXPERIENCE", "PROJECTS", "ACHIEVEMENTS", "CONTACT"],
    [],
  )

  return (
    <nav
      aria-label="Section navigation"
      className="pointer-events-auto fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:block"
    >
      <div className="relative h-48 w-3 flex items-center justify-center">
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px rounded-full bg-primary/15 overflow-hidden">
          <div
            ref={fillRef}
            className="absolute left-0 right-0 top-0 bottom-0 origin-top"
            style={{
              background: "linear-gradient(180deg, #6c5ce7, #a29bfe, #fbbf24)",
              opacity: 0.75,
              transformOrigin: "top",
              transform: "scaleY(0)",
            }}
          />
        </div>

        <div className="absolute inset-0 flex flex-col justify-between items-center">
          {scenes.map((s) => {
            const active = current === s
            return (
              <button
                key={s}
                onClick={() => scrollToSection(s)}
                aria-label={`Navigate to ${s.toLowerCase()} section`}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group relative rounded-full transition-all duration-300 interactive",
                  active
                    ? "w-2.5 h-2.5 bg-primary shadow-[0_0_12px_rgba(108,92,231,0.7)]"
                    : "w-1.5 h-1.5 bg-primary/30 hover:bg-primary/60",
                )}
              >
                <span
                  className={cn(
                    "absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium tracking-[0.2em] uppercase transition-all duration-300",
                    active
                      ? "opacity-100 text-primary translate-x-0"
                      : "opacity-0 group-hover:opacity-70 text-muted-foreground translate-x-1 group-hover:translate-x-0",
                  )}
                >
                  {s}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
