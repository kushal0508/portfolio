"use client"

import { useEffect, useRef, useState } from "react"

const TRAIL_COUNT = 8

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<HTMLDivElement[]>([])
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const trailPositions = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 })))
  const rafRef = useRef(0)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
    }

    const onMouseDown = () => {
      setClicked(true)
      setTimeout(() => setClicked(false), 150)
    }

    const onMouseUp = () => {
      setClicked(false)
    }

    const checkHover = () => {
      const el = document.elementFromPoint(target.current.x, target.current.y)
      if (!el) return
      const isInteractive = el.closest("a, button, [role='button'], [role='link'], input, textarea, select, .interactive")
      setHovered(!!isInteractive)
    }

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18
      pos.current.y += (target.current.y - pos.current.y) * 0.18

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`
      }
      if (followerRef.current) {
        const scale = hovered ? 2.0 : clicked ? 0.5 : 1
        followerRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) scale(${scale})`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        followerRef.current.style.mixBlendMode = (hovered ? "difference" : "normal") as any
      }

      trailPositions.current[0] = { ...pos.current }
      for (let i = 1; i < TRAIL_COUNT; i++) {
        const prev = trailPositions.current[i - 1]
        const curr = trailPositions.current[i]
        curr.x += (prev.x - curr.x) * 0.25
        curr.y += (prev.y - curr.y) * 0.25
        const el = trailRefs.current[i]
        if (el) {
          const fade = 1 - i / TRAIL_COUNT
          el.style.transform = `translate(${curr.x}px, ${curr.y}px)`
          el.style.opacity = String(hovered ? 0 : fade * 0.35)
          el.style.width = `${fade * 6}px`
          el.style.height = `${fade * 6}px`
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    const interval = setInterval(checkHover, 50)

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearInterval(interval)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [hovered, clicked])

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
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 z-[998] pointer-events-none rounded-full"
        style={{
          width: hovered ? 40 : 20,
          height: hovered ? 40 : 20,
          border: "1px solid rgba(108,92,231,0.3)",
          background: hovered ? "rgba(108,92,231,0.08)" : "transparent",
          transform: "translate(-50%, -50%)",
          transition: "width 0.4s ease, height 0.4s ease, background 0.3s ease",
          backdropFilter: hovered ? "blur(4px)" : "none",
        }}
      />
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailRefs.current[i] = el }}
          className="fixed top-0 left-0 z-[997] pointer-events-none rounded-full"
          style={{
            background: "#a29bfe",
            transform: "translate(-50%, -50%)",
            transition: "width 0.4s ease, height 0.4s ease",
            opacity: 0,
          }}
        />
      ))}
    </>
  )
}