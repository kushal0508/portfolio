"use client"

import { useEffect, useRef } from "react"

const TRAIL_COUNT = 6

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<(HTMLDivElement | null)[]>([])
  const state = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    hovered: false,
    clicked: false,
  })
  const trailPos = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 })))
  const rafRef = useRef(0)

  useEffect(() => {
    const s = state.current

    const onMouseMove = (e: MouseEvent) => {
      s.tx = e.clientX
      s.ty = e.clientY
    }

    const onMouseDown = () => {
      s.clicked = true
    }

    const onMouseUp = () => {
      s.clicked = false
    }

    const animate = () => {
      s.x += (s.tx - s.x) * 0.18
      s.y += (s.ty - s.y) * 0.18

      const cursor = cursorRef.current
      const follower = followerRef.current
      if (cursor) {
        cursor.style.transform = `translate(${s.tx}px, ${s.ty}px)`
      }
      if (follower) {
        const scale = s.hovered ? 2.0 : s.clicked ? 0.5 : 1
        follower.style.transform = `translate(${s.x}px, ${s.y}px) scale(${scale})`
        follower.style.width = s.hovered ? "40px" : "20px"
        follower.style.height = s.hovered ? "40px" : "20px"
        follower.style.background = s.hovered ? "rgba(108,92,231,0.08)" : "transparent"
        follower.style.backdropFilter = s.hovered ? "blur(4px)" : "none"
      }

      trailPos.current[0] = { x: s.x, y: s.y }
      for (let i = 1; i < TRAIL_COUNT; i++) {
        const prev = trailPos.current[i - 1]
        const curr = trailPos.current[i]
        curr.x += (prev.x - curr.x) * 0.25
        curr.y += (prev.y - curr.y) * 0.25
        const el = trailRefs.current[i]
        if (el) {
          const fade = 1 - i / TRAIL_COUNT
          el.style.transform = `translate(${curr.x}px, ${curr.y}px)`
          el.style.opacity = s.hovered ? "0" : String(fade * 0.35)
          el.style.width = `${fade * 6}px`
          el.style.height = `${fade * 6}px`
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    // Detect interactive elements on mousemove
    const checkHover = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el) return
      s.hovered = !!el.closest("a, button, [role='button'], [role='link'], input, textarea, select, .interactive")
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mousemove", checkHover, { passive: true })
    window.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mousemove", checkHover)
      window.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[999] pointer-events-none"
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#6c5ce7",
          transform: "translate(-50%, -50%)",
          transition: "width 0.3s, height 0.3s",
          boxShadow: "0 0 10px rgba(108,92,231,0.5)",
        }}
        aria-hidden
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 z-[998] pointer-events-none rounded-full"
        style={{
          width: 20,
          height: 20,
          border: "1px solid rgba(108,92,231,0.3)",
          background: "transparent",
          transform: "translate(-50%, -50%)",
          transition: "width 0.4s ease, height 0.4s ease, background 0.3s ease, backdrop-filter 0.3s ease",
        }}
        aria-hidden
      />
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { trailRefs.current[i] = el }}
          className="fixed top-0 left-0 z-[997] pointer-events-none rounded-full"
          style={{
            background: "#a29bfe",
            transform: "translate(-50%, -50%)",
            transition: "width 0.4s ease, height 0.4s ease",
            opacity: 0,
          }}
          aria-hidden
        />
      ))}
    </>
  )
}
