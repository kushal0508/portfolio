"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { ScrollProvider } from "@/lib/scroll-provider"
import { SectionOverlays, Navigation } from "@/components/overlays/section-overlays"
import { CinematicHaze, JourneyCompass } from "@/components/overlays/cinematic-haze"
import { CinematicLoader } from "@/components/layout/cinematic-loader"
import { CustomCursor } from "@/components/ui/custom-cursor"

const CinematicCanvas = dynamic(
  () => import("./cinematic-canvas"),
  {
    ssr: false,
    loading: () => null,
  },
)

export function CinematicWorld() {
  return (
    <ScrollProvider>
      <CinematicLoader />
      <CustomCursor />
      <Navigation />
      <JourneyCompass />
      <div className="vignette" />
      <div className="film-grain" />
      <div className="fixed inset-0 z-0">
        <Suspense fallback={null}>
          <CinematicCanvas />
        </Suspense>
      </div>
      {/* Haze blends the overlays into the world (sits between canvas & DOM). */}
      <CinematicHaze />
      <SectionOverlays />
      <div className="h-[9000px] w-full relative z-10" />
    </ScrollProvider>
  )
}