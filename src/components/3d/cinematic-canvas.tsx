"use client"

import { useEffect, useState, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { CameraController } from "./camera-controller"
import { PostEffects, AmbientParticles } from "./effects"
import { SceneLighting } from "./scene-lighting"
import { ConnectedWorld } from "./connected-world"
import { TransitionStreams } from "./transition-streams"
import { OpeningScene } from "./scenes/opening"
import { DigitalUniverse } from "./scenes/digital-universe"
import { TechPlanets } from "./scenes/tech-planets"
import { CorridorScene } from "./scenes/corridor"
import { GalleryScene } from "./scenes/gallery"
import { ChamberScene } from "./scenes/chamber"
import { TerminalScene } from "./scenes/terminal"
import { ErrorBoundary, CanvasErrorFallback, ThreeDCanvasWrapper } from "./error-boundary"
import { getDeviceTier, isMobileDevice, getAdaptiveDPR } from "@/lib/device-detect"
import type { DeviceTier } from "@/lib/device-detect"

function CanvasContent({ prefersReducedMotion, deviceTier, isMobile }: { prefersReducedMotion: boolean; deviceTier: DeviceTier; isMobile: boolean }) {
  return (
    <>
      <color attach="background" args={["#08080f"]} />
      <fog attach="fog" args={["#08080f", deviceTier === "low" ? 8 : 14, deviceTier === "low" ? 60 : 110]} />

      <CameraController reducedMotion={prefersReducedMotion} deviceTier={deviceTier} isMobile={isMobile} />
      <SceneLighting reducedMotion={prefersReducedMotion} deviceTier={deviceTier} />
      <ConnectedWorld reducedMotion={prefersReducedMotion} deviceTier={deviceTier} />

      {!isMobile && <TransitionStreams />}

      <OpeningScene reducedMotion={prefersReducedMotion} deviceTier={deviceTier} />
      {!isMobile && <DigitalUniverse />}
      {!isMobile && <TechPlanets />}
      <CorridorScene reducedMotion={prefersReducedMotion} deviceTier={deviceTier} />
      {!isMobile && <GalleryScene />}
      {!isMobile && <ChamberScene />}
      <TerminalScene reducedMotion={prefersReducedMotion} deviceTier={deviceTier} />

      <AmbientParticles reducedMotion={prefersReducedMotion} count={isMobile ? 100 : deviceTier === "low" ? 200 : deviceTier === "medium" ? 400 : 800} />
      {(!isMobile || prefersReducedMotion) && <PostEffects reducedMotion={prefersReducedMotion} deviceTier={deviceTier} />}
    </>
  )
}

export default function CinematicCanvas() {
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

  const deviceTier: DeviceTier = typeof window !== "undefined" ? getDeviceTier() : "high"
  const isMobile = typeof window !== "undefined" ? isMobileDevice() : false
  const dpr = typeof window !== "undefined" ? getAdaptiveDPR() : 1
  const useMSAA = isMobile ? 0 : deviceTier === "high" ? 4 : deviceTier === "medium" ? 2 : 0

  return (
    <ErrorBoundary fallback={<CanvasErrorFallback />}>
      <ThreeDCanvasWrapper fallback={<CanvasErrorFallback />}>
        <Canvas
          camera={{ position: [0, 1.6, 11], fov: 58, near: 0.1, far: isMobile ? 100 : deviceTier === "low" ? 100 : 200 }}
          dpr={[0.75, dpr]}
          gl={{
            antialias: useMSAA > 0,
            alpha: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
            toneMapping: 3,
            toneMappingExposure: isMobile ? 1.0 : 1.15,
            preserveDrawingBuffer: false,
          }}
          performance={{ min: isMobile ? 0.15 : deviceTier === "low" ? 0.2 : 0.35 }}
          frameloop={prefersReducedMotion || isMobile ? "demand" : "always"}
        >
          <Suspense fallback={null}>
            <CanvasContent prefersReducedMotion={prefersReducedMotion} deviceTier={deviceTier} isMobile={isMobile} />
          </Suspense>
        </Canvas>
      </ThreeDCanvasWrapper>
    </ErrorBoundary>
  )
}