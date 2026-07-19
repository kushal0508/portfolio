"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useScrollState } from "@/lib/scroll-provider"
import { WAYPOINTS } from "@/lib/camera-path"

/**
 * Visual-storytelling transition streams.
 *
 * As the camera flies between two scenes, a flowing band of particles
 * streams along the camera path connecting them — so tech particles
 * appear to become skills, the corridor naturally reveals experience,
 * etc. Each bridge orbits the segment between consecutive waypoints
 * with a colour cross-fade from the outbound scene accent to the
 * inbound scene accent.
 */

const SEGMENTS = WAYPOINTS.length - 1

const _colorA = new THREE.Color()
const _colorB = new THREE.Color()

export function TransitionStreams() {
  const { progress } = useScrollState()
  const ref = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.PointsMaterial>(null)

  // Build a flowing particle band along each path segment.
  const { positions, colors, count, segPositions } = useMemo(() => {
    const perSeg = 600
    const total = perSeg * SEGMENTS
    const arr = new Float32Array(total * 3)
    const col = new Float32Array(total * 3)
    const perSegArr: { startZ: number; endZ: number; aColor: THREE.Color; bColor: THREE.Color }[] = []

    for (let s = 0; s < SEGMENTS; s++) {
      const a = WAYPOINTS[s]
      const b = WAYPOINTS[s + 1]
      const aColor = _colorA.set(hexFromKey(a.key))
      const bColor = _colorB.set(hexFromKey(b.key))
      perSegArr.push({
        startZ: a.pos[2],
        endZ: b.pos[2],
        aColor: aColor.clone(),
        bColor: bColor.clone(),
      })
      for (let i = 0; i < perSeg; i++) {
        const idx = s * perSeg + i
        const t = i / perSeg
        // Slight orbital spread around the path centreline.
        const angle = (idx * 0.3) % (Math.PI * 2)
        const radius = 1.6 + Math.sin(idx * 0.05) * 0.6
        const x = Math.cos(angle) * radius * 0.6 + THREE.MathUtils.lerp(a.pos[0], b.pos[0], t) * 0.5
        const y = 1.6 + Math.sin(angle) * radius * 0.4 + (a.pos[1] + b.pos[1]) * 0.0
        const z = THREE.MathUtils.lerp(a.pos[2], b.pos[2], t)
        const base = idx * 3
        arr[base] = x
        arr[base + 1] = y
        arr[base + 2] = z
        const colMix = aColor.clone().lerp(bColor, t)
        col[base] = colMix.r
        col[base + 1] = colMix.g
        col[base + 2] = colMix.b
      }
    }

    return { positions: arr, colors: col, count: total, segPositions: perSegArr }
  }, [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return g
  }, [positions, colors])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!ref.current) return

    const pos = ref.current.geometry.attributes.position.array as Float32Array
    const perSeg = Math.floor(count / SEGMENTS)

    // Make particles flow along their segment with a wrap — gives a constant
    // "data streaming toward the next scene" feel.
    for (let s = 0; s < SEGMENTS; s++) {
      const seg = segPositions[s]
      const span = seg.endZ - seg.startZ // negative
      const flow = (t * 3.5) % Math.abs(span)
      for (let i = 0; i < perSeg; i++) {
        const idx = s * perSeg + i
        const base = idx * 3
        // Advance toward the inbound scene (negative Z), then wrap.
        let z = seg.startZ - flow * Math.sign(span === 0 ? 1 : span)
        if (z > seg.startZ) z -= Math.abs(span)
        if (z < seg.endZ) z += Math.abs(span)
        pos[base + 2] = z
        // Subtle bob for life.
        pos[base + 1] = positions[base + 1] + Math.sin(t * 0.6 + i * 0.02) * 0.08
        pos[base] = positions[base] + Math.cos(t * 0.4 + i * 0.03) * 0.04
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true

    // Brightness rises for segments the camera is currently flying through.
    if (matRef.current) {
      const live = Math.min(SEGMENTS - 1, Math.max(0, Math.floor(progress * SEGMENTS)))
      const local = progress * SEGMENTS - live
      const proximity = 1 - Math.abs(local - 0.5) * 2
      matRef.current.opacity = 0.22 + Math.max(0, proximity) * 0.28
    }
  })

  return (
    <points ref={ref}>
      <primitive object={geometry} />
      <pointsMaterial
        ref={matRef}
        size={0.07}
        vertexColors
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function hexFromKey(key: string): string {
  switch (key) {
    case "OPENING":
      return "#6c5ce7"
    case "ABOUT":
      return "#a29bfe"
    case "SKILLS":
      return "#00cec9"
    case "EXPERIENCE":
      return "#fd79a8"
    case "PROJECTS":
      return "#f59e0b"
    case "ACHIEVEMENTS":
      return "#fbbf24"
    case "CONTACT":
    case "ENDING":
      return "#00ff88"
    default:
      return "#6c5ce7"
  }
}