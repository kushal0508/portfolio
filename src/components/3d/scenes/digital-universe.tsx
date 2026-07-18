"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"
import { useScrollState } from "@/lib/scroll-provider"

const PRIMARY = "#6c5ce7"
const ACCENT = "#fbbf24"
const GLOW = "#a29bfe"

const random = Math.random

export function DigitalUniverse() {
  const { progress } = useScrollState()
  const sectionProgress = Math.max(0, Math.min(1, (progress - 0.125) / 0.125))

  return (
    <group>
      <Starfield sectionProgress={sectionProgress} />
      <NebulaClouds sectionProgress={sectionProgress} />
      <DataStreams sectionProgress={sectionProgress} />
      <ConstellationNodes sectionProgress={sectionProgress} />
    </group>
  )
}

function Starfield({ sectionProgress }: { sectionProgress: number }) {
  const ref = useRef<THREE.Points>(null)
  const count = 3000

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const depths = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 15 + random() * 50
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)

      arr[i3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      arr[i3 + 2] = radius * Math.cos(phi) - 25

      const color = new THREE.Color()
      const isWarm = random() > 0.5
      color.setHSL(isWarm ? 0.1 : 0.65 + random() * 0.2, 0.6, 0.5 + random() * 0.4)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = 0.005 + random() * 0.02
      depths[i] = radius
    }
    return { arr, colors, sizes, depths }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y = t * 0.0005
      ;(ref.current.material as THREE.PointsMaterial).opacity = 0.4 * sectionProgress
      ;(ref.current.material as THREE.PointsMaterial).size = (0.015 + sectionProgress * 0.01) * (window.devicePixelRatio || 1)
    }
  })

  return (
    <points ref={ref} position={[0, 0, -14]}>
      <bufferGeometry>
        <bufferAttribute args={[positions.arr, 3]} attach="attributes-position" array={positions.arr} itemSize={3} />
        <bufferAttribute args={[positions.colors, 3]} attach="attributes-color" array={positions.colors} itemSize={3} />
        <bufferAttribute args={[positions.sizes, 1]} attach="attributes-size" array={positions.sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        transparent
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function NebulaClouds({ sectionProgress }: { sectionProgress: number }) {
  const layers = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({
        z: -10 - i * 12,
        scale: 8 + i * 2,
        color: i % 3 === 0 ? PRIMARY : i % 3 === 1 ? GLOW : ACCENT,
        speed: 0.02 + i * 0.005,
        phase: i * 1.2,
      })),
    [],
  )

  return (
    <group position={[0, 0, -14]}>
      {layers.map((l, i) => (
        <mesh
          key={i}
          position={[0, 0, l.z]}
          scale={l.scale * sectionProgress}
          rotation={[0, 0, 0]}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={l.color}
            transparent
            opacity={0.04 * sectionProgress}
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

function DataStreams({ sectionProgress }: { sectionProgress: number }) {
  const streams = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        return {
          angle,
          radius: 6 + random() * 10,
          height: 20 + random() * 15,
          speed: 0.1 + random() * 0.1,
          phase: random() * Math.PI * 2,
          color: i % 3 === 0 ? PRIMARY : i % 3 === 1 ? GLOW : ACCENT,
          thickness: 0.02 + random() * 0.02,
        }
      }),
    [],
  )

  return (
    <group position={[0, 0, -14]}>
      {streams.map((s, i) => (
        <DataStreamLine key={i} stream={s} sectionProgress={sectionProgress} />
      ))}
    </group>
  )
}

function DataStreamLine({
  stream,
  sectionProgress,
}: {
  stream: {
    angle: number
    radius: number
    height: number
    speed: number
    phase: number
    color: string
    thickness: number
  }
  sectionProgress: number
}) {
  const ref = useRef<THREE.Line>(null)
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      pts.push(new THREE.Vector3(0, -stream.height / 2 + t * stream.height, 0))
    }
    return pts
  }, [stream.height])

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i <= 20; i++) {
        const tNorm = i / 20
        const wave = Math.sin(t * stream.speed + stream.phase + tNorm * Math.PI * 4)
        const x = stream.radius * Math.cos(stream.angle + wave * 0.3)
        const z = stream.radius * Math.sin(stream.angle + wave * 0.3)
        positions[i * 3] = x
        positions[i * 3 + 2] = z
      }
      ref.current.geometry.attributes.position.needsUpdate = true
      ;(ref.current.material as THREE.LineBasicMaterial).opacity = 0.3 * sectionProgress
    }
  })

  return (
    // @ts-expect-error - R3F <line> conflicts with SVG line element types
    <line ref={ref as unknown as React.RefObject<THREE.Line | null>} geometry={geometry}>
      <lineBasicMaterial
        color={stream.color}
        transparent
        opacity={0.3 * sectionProgress}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  )
}

function ConstellationNodes({ sectionProgress }: { sectionProgress: number }) {
  const nodes = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        angle: (i / 8) * Math.PI * 2 + i * 0.2,
        radius: 8 + random() * 8,
        height: (random() - 0.5) * 6,
        size: 0.15 + random() * 0.1,
        color: i % 3 === 0 ? PRIMARY : i % 3 === 1 ? GLOW : ACCENT,
        pulseSpeed: 1 + random() * 1.5,
        pulsePhase: random() * Math.PI * 2,
      })),
    [],
  )

  return (
    <group position={[0, 0, -14]}>
      {nodes.map((n, i) => (
        <Float key={i} speed={2 + i * 0.2} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh
            position={[Math.cos(n.angle) * n.radius, n.height, Math.sin(n.angle) * n.radius]}
            scale={sectionProgress}
          >
            <octahedronGeometry args={[n.size, 0]} />
            <meshPhysicalMaterial
              color={n.color}
              emissive={n.color}
              emissiveIntensity={1.5}
              metalness={0.3}
              roughness={0.1}
              transparent
              opacity={0.9 * sectionProgress}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}