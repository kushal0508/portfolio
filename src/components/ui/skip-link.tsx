"use client"

import { useEffect, useState } from "react"

export function SkipLink() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setVisible(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <a
      href="#main-content"
      className={`sr-only focus:not-sr-only fixed top-4 left-4 z-[200] px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200`}
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
      }}
    >
      Skip to main content
    </a>
  )
}