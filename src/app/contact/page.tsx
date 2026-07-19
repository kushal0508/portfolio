"use client"

import { useEffect, useRef } from "react"
import { CinematicWorld } from "@/components/3d/cinematic-world"
import { useScrollState, TOTAL_SCROLL } from "@/lib/scroll-provider"

export default function ContactPage() {
  const { lenis } = useScrollState()
  const initialized = useRef(false)

  useEffect(() => {
    history.replaceState(null, "", "#contact")

    if (lenis) {
      lenis.scrollTo(TOTAL_SCROLL * 0.875, { immediate: true })
      initialized.current = true
    }
  }, [lenis])

  return <CinematicWorld />
}
