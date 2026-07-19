"use client"

import { useEffect, useState, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import type { WebGLRenderer } from "three"
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

function CanvasContent({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <>
      <color attach="background" args={["#08080f"]} />
      {/* Fog density reflects per-scene palette via <AtmosphericFog/> in effects. */}
      <fog attach="fog" args={["#08080f", 14, 110]} />

      <CameraController reducedMotion={prefersReducedMotion} />
      <SceneLighting />

      {/* The connected environment stitches every scene into one world. */}
      <ConnectedWorld reducedMotion={prefersReducedMotion} />
      <TransitionStreams />

      {/* Distinct scenes ride inside the world. */}
      <OpeningScene reducedMotion={prefersReducedMotion} />
      <DigitalUniverse />
      <TechPlanets />
      <CorridorScene />
      <GalleryScene />
      <ChamberScene />
      <TerminalScene />

      <AmbientParticles reducedMotion={prefersReducedMotion} />
      <PostEffects reducedMotion={prefersReducedMotion} />
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

  const handleCreated = (state: { gl: WebGLRenderer }) => {
    state.gl.domElement.style.background = "#08080f"
  }

  return (
    <ErrorBoundary fallback={<CanvasErrorFallback />}>
      <ThreeDCanvasWrapper fallback={<CanvasErrorFallback />}>
        <Canvas
          camera={{ position: [0, 1.6, 11], fov: 58, near: 0.1, far: 200 }}
          dpr={[1, 1.5]}
          style={{ background: "#08080f" }}
          onCreated={handleCreated}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
            toneMapping: 3,
            toneMappingExposure: 1.25,
          }}
          performance={{ min: 0.35 }}
        >
          <Suspense fallback={null}>
            <CanvasContent prefersReducedMotion={prefersReducedMotion} />
          </Suspense>
        </Canvas>
      </ThreeDCanvasWrapper>
    </ErrorBoundary>
  )
}