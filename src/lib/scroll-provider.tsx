"use client"

import { createContext, useContext, useRef, useState, useEffect, useMemo, type ReactNode } from "react"
import Lenis from "@studio-freight/lenis"
import * as THREE from "three"
import { lerp } from "./utils"
import { sampleCameraPath, samplePalette, applyDollyAndElevation, type CameraSample } from "./camera-path"

export interface ScrollState {
  progress: number
  scrollY: number
  // Legacy linear path fields (kept for backwards compatibility with
  // existing scenes that still read targetX/Y/Z). Driven by the new
  // choreographed curve so they always stay in sync with the camera.
  targetX: number
  targetY: number
  targetZ: number
  // New choreographed camera fields. Downstream consumers should prefer these.
  camX: number
  camY: number
  camZ: number
  lookX: number
  lookY: number
  lookZ: number
  bank: number
  camFov: number
  camSpeed: number
  // Per-scene palette weights cross-faded along the journey.
  fogR: number
  fogG: number
  fogB: number
  accentR: number
  accentG: number
  accentB: number
  tintR: number
  tintG: number
  tintB: number
  bloom: number
  mouseX: number
  mouseY: number
  smoothMouseX: number
  smoothMouseY: number
  speed: number
  velocity: number
  direction: number
  // Lenis instance for snap scrolling
  lenis?: InstanceType<typeof Lenis>
}

const defaultState: ScrollState = {
  progress: 0,
  scrollY: 0,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  camX: 0,
  camY: 0,
  camZ: 0,
  lookX: 0,
  lookY: 0,
  lookZ: 0,
  bank: 0,
  camFov: 58,
  camSpeed: 0,
  fogR: 0.031,
  fogG: 0.031,
  fogB: 0.059,
  accentR: 0.42,
  accentG: 0.36,
  accentB: 0.91,
  tintR: 0.64,
  tintG: 0.61,
  tintB: 1.0,
  bloom: 0.5,
  mouseX: 0,
  mouseY: 0,
  smoothMouseX: 0,
  smoothMouseY: 0,
  speed: 0,
  velocity: 0,
  direction: 0,
  lenis: undefined,
}

const ScrollContext = createContext<ScrollState>(defaultState)

export const CAMERA_PATH: {
  key: SectionKey
  start: number
  end: number
  pos: [number, number, number]
}[] = [
  { key: "OPENING", start: 0.0, end: 0.125, pos: [0, 1.2, 8] },
  { key: "ABOUT", start: 0.125, end: 0.25, pos: [1.5, 1.8, -10] },
  { key: "SKILLS", start: 0.25, end: 0.375, pos: [-1.5, 1.5, -30] },
  { key: "EXPERIENCE", start: 0.375, end: 0.5, pos: [1.8, 2.2, -50] },
  { key: "PROJECTS", start: 0.5, end: 0.625, pos: [-1.2, 1.8, -70] },
  { key: "ACHIEVEMENTS", start: 0.625, end: 0.75, pos: [1, 2.5, -90] },
  { key: "CONTACT", start: 0.75, end: 1.0, pos: [0, 1.2, -114] },
]

export const SECTION_RANGES = CAMERA_PATH.map((p) => ({
  key: p.key,
  start: p.start,
  end: p.end,
}))

export type SectionKey =
  | "OPENING"
  | "ABOUT"
  | "SKILLS"
  | "EXPERIENCE"
  | "PROJECTS"
  | "ACHIEVEMENTS"
  | "CONTACT"

export const SECTION_Z: Record<SectionKey, number> = CAMERA_PATH.reduce(
  (acc, p) => {
    acc[p.key] = p.pos[2]
    return acc
  },
  {} as Record<SectionKey, number>,
)

// Persistent last-section for hysteresis — prevents flickering between
// adjacent sections when the user pauses near a boundary.
let lastStableSection: SectionKey = "OPENING"


export function getCurrentSectionKey(progress: number): SectionKey {
  // Find the exact section for the current progress
  let exactSection: SectionKey = "CONTACT"
  for (const r of SECTION_RANGES) {
    if (progress >= r.start && progress < r.end) {
      exactSection = r.key
      break
    }
  }

  // Hysteresis: require crossing the midpoint to switch away from last section
  // This prevents flickering when progress hovers near a boundary.
  const lastRange = SECTION_RANGES.find((r) => r.key === lastStableSection)
  if (lastRange) {
    const lastMid = (lastRange.start + lastRange.end) / 2
    const distanceFromMid = Math.abs(progress - lastMid)
    const halfWidth = (lastRange.end - lastRange.start) / 2

    // If we're still within the last section's range and haven't crossed the midpoint,
    // stick with the last stable section.
    if (progress >= lastRange.start && progress <= lastRange.end && distanceFromMid < halfWidth * 0.9) {
      return lastStableSection
    }
  }

  // Record the transition
  if (exactSection !== lastStableSection) {
    lastStableSection = exactSection
  }

  return exactSection
}

export function getSectionIntensity(section: SectionKey, progress: number): number {
  const r = SECTION_RANGES.find((s) => s.key === section)
  if (!r) return 0
  const mid = (r.start + r.end) / 2
  const halfWidth = (r.end - r.start) / 2
  return Math.max(0, 1 - Math.abs(progress - mid) / halfWidth)
}

export const TOTAL_SCROLL = 8000

// Section snap scroll configuration
export const SECTION_SNAP_CONFIG = {
  enabled: true,
  threshold: 0.3, // Scroll threshold to trigger snap (30% of viewport)
  duration: 800, // Snap animation duration in ms
  easing: (t: number) => 1 - Math.pow(1 - t, 4), // Same easing as Lenis
} as const

export function useScrollState() {
  return useContext(ScrollContext)
}

// Intersection Observer hook for active section tracking
export function useActiveSection() {
  const { progress } = useScrollState()
  
  // Use the progress-based section detection as primary
  // This is more reliable for the smooth scroll implementation
  return getCurrentSectionKey(progress)
}

// Snap scroll function
export function snapToSection(sectionKey: SectionKey, lenis?: InstanceType<typeof Lenis>) {
  const range = SECTION_RANGES.find((r) => r.key === sectionKey)
  if (!range) return
  
  const targetProgress = (range.start + range.end) / 2
  const targetScroll = targetProgress * TOTAL_SCROLL
  
  if (lenis) {
    lenis.scrollTo(targetScroll, {
      duration: SECTION_SNAP_CONFIG.duration / 1000,
      easing: SECTION_SNAP_CONFIG.easing,
    })
  } else {
    window.scrollTo({ top: targetScroll, behavior: "smooth" })
  }
}

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScrollState>(defaultState)
  const rafRef = useRef(0)
  const smoothMouse = useRef({ x: 0, y: 0 })
  const lastVelocity = useRef(0)
  const mouseTarget = useRef({ x: 0, y: 0 })
  const lenisRef = useRef<InstanceType<typeof Lenis> | null>(null)

  // Reusable per-frame scratch objects to avoid allocations in the RAF loop.
  const sample = useMemo<CameraSample>(
    () => ({
      position: new THREE.Vector3(0, 1.6, 11),
      lookAt: new THREE.Vector3(0, 1.4, -4),
      bank: 0,
      speed: 0,
      fov: 58,
    }),
    [],
  )
  const fog = useMemo(() => new THREE.Color("#08080f"), [])
  const accent = useMemo(() => new THREE.Color("#6c5ce7"), [])
  const tint = useMemo(() => new THREE.Color("#a29bfe"), [])
  const bloom = useMemo(() => ({ value: 0.5 }), [])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    })

    // Store lenis instance for snap scrolling
    lenisRef.current = lenis

    const update = (time: number) => {
      lenis.raf(time)

      const sy = lenis.scroll
      const progress = Math.min(1, Math.max(0, sy / TOTAL_SCROLL))
      const velocity = (lenis as { velocity?: number }).velocity ?? 0

      // Sample the choreographed drone path (curves + banking + dolly +
      // elevation + per-scene palette). The path module is allocation-free
      // on the hot path beyond the THREE temporary scratch it owns.
      sampleCameraPath(progress, sample)
      applyDollyAndElevation(sample, -1, progress)
      samplePalette(progress, fog, accent, tint, bloom)

      const mouseDamp = 1 - Math.pow(0.015, 1 / 60)
      smoothMouse.current.x = lerp(smoothMouse.current.x, mouseTarget.current.x, mouseDamp)
      smoothMouse.current.y = lerp(smoothMouse.current.y, mouseTarget.current.y, mouseDamp)

      lastVelocity.current = lerp(lastVelocity.current, velocity, 0.1)

      setState((prev) => ({
        ...prev,
        progress,
        scrollY: sy,
        // Backwards-compatible linear fields (driven by the curve).
        targetX: sample.position.x,
        targetY: sample.position.y,
        targetZ: sample.position.z,
        // Choreographed camera fields.
        camX: sample.position.x,
        camY: sample.position.y,
        camZ: sample.position.z,
        lookX: sample.lookAt.x,
        lookY: sample.lookAt.y,
        lookZ: sample.lookAt.z,
        bank: sample.bank,
        camFov: sample.fov,
        camSpeed: sample.speed,
        // Palette (per-scene lighting / fog / post FX).
        fogR: fog.r,
        fogG: fog.g,
        fogB: fog.b,
        accentR: accent.r,
        accentG: accent.g,
        accentB: accent.b,
        tintR: tint.r,
        tintG: tint.g,
        tintB: tint.b,
        bloom: bloom.value,
        mouseX: mouseTarget.current.x,
        mouseY: mouseTarget.current.y,
        smoothMouseX: smoothMouse.current.x,
        smoothMouseY: smoothMouse.current.y,
        speed: Math.abs(velocity),
        velocity,
        direction: velocity > 0.1 ? 1 : velocity < -0.1 ? -1 : prev.direction,
        lenis,
      }))

      rafRef.current = requestAnimationFrame(update)
    }

    const handleMouse = (e: MouseEvent) => {
      mouseTarget.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
    }

    // Snap scroll on wheel - detect scroll direction and snap to next/prev section
    const handleWheel = (e: WheelEvent) => {
      if (!SECTION_SNAP_CONFIG.enabled) return
      
      const lenis = lenisRef.current
      if (!lenis) return

      // Don't snap if we're already animating
      if (lenis.isScrolling) return

      const progress = lenis.scroll / TOTAL_SCROLL
      const currentSection = getCurrentSectionKey(progress)
      const currentIndex = SECTION_RANGES.findIndex(r => r.key === currentSection)
      
      if (currentIndex === -1) return

      // Determine scroll direction
      const deltaY = e.deltaY
      let targetSection: SectionKey | null = null

      if (deltaY > 0 && currentIndex < SECTION_RANGES.length - 1) {
        // Scroll down - go to next section
        targetSection = SECTION_RANGES[currentIndex + 1].key
      } else if (deltaY < 0 && currentIndex > 0) {
        // Scroll up - go to previous section
        targetSection = SECTION_RANGES[currentIndex - 1].key
      }

      if (targetSection) {
        e.preventDefault()
        snapToSection(targetSection, lenis)
      }
    }

    rafRef.current = requestAnimationFrame(update)
    window.addEventListener("mousemove", handleMouse, { passive: true })
    window.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", handleMouse)
      window.removeEventListener("wheel", handleWheel)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [sample, fog, accent, tint, bloom])

  return (
    <ScrollContext.Provider value={state}>
      {children}
    </ScrollContext.Provider>
  )
}