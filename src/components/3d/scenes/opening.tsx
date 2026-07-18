"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Float, Html } from "@react-three/drei"
import * as THREE from "three"
import { useScrollState } from "@/lib/scroll-provider"
import type { DeviceTier } from "@/lib/device-detect"

const PRIMARY = "#6c5ce7"
const ACCENT = "#fbbf24"

const random = Math.random

interface OpeningSceneProps {
  reducedMotion?: boolean
  deviceTier?: DeviceTier
}

export function OpeningScene({ reducedMotion = false, deviceTier = "high" }: OpeningSceneProps) {
  const { progress } = useScrollState()
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const isLow = deviceTier === "low"

  const sectionProgress = Math.min(1, progress / 0.125)

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.8, isLow ? 1 : 3), [isLow])
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: PRIMARY,
        metalness: 0.6,
        roughness: 0.15,
        transmission: isLow ? 0 : 0.3,
        thickness: 0.4,
        ior: 1.33,
        clearcoat: isLow ? 0 : 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: isLow ? 0.5 : 1.5,
      }),
    [isLow],
  )

  const wireMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: ACCENT,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      }),
    [],
  )

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.03
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.08
      innerRef.current.rotation.x = t * 0.04
      innerRef.current.scale.setScalar(0.6 + sectionProgress * 0.4 + Math.sin(t * 1.5) * 0.015)
    }
  })

  const introOpacity = Math.max(0, 1 - progress / 0.1)
  const particleCount = isLow ? 80 : 300
  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const radius = 3 + random() * 8
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)

      arr[i3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      arr[i3 + 2] = radius * Math.cos(phi) - 8

      const color = new THREE.Color()
      color.setHSL(0.72 + random() * 0.18, 0.6, 0.3 + random() * 0.4)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = 0.02 + random() * 0.06
      velocities[i3] = (random() - 0.5) * 0.0015
      velocities[i3 + 1] = (random() - 0.5) * 0.0015
      velocities[i3 + 2] = (random() - 0.5) * 0.0015
    }
    return { arr, colors, sizes, velocities }
  }, [])

  const particleRef = useRef<THREE.Points>(null)

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.getElapsedTime()
    const dt = clock.getDelta()

    if (particleRef.current) {
      const pos = particleRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        pos[i3] += positions.velocities[i3] * 60 * dt
        pos[i3 + 1] += positions.velocities[i3 + 1] * 60 * dt + Math.sin(t * 0.3 + i) * 0.0008
        pos[i3 + 2] += positions.velocities[i3 + 2] * 60 * dt

        if (pos[i3 + 2] > 20) pos[i3 + 2] = -30
      }
      particleRef.current.geometry.attributes.position.needsUpdate = true
      ;(particleRef.current.material as THREE.PointsMaterial).opacity = introOpacity * 0.5
    }
  })

  return (
    <group ref={groupRef} position={[0, 1.5, 8]}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <group ref={innerRef}>
          <mesh geometry={geometry} material={material} castShadow receiveShadow />
          <mesh geometry={geometry} material={wireMaterial} />
        </group>
      </Float>

      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute args={[positions.arr, 3]} attach="attributes-position" array={positions.arr} itemSize={3} />
          <bufferAttribute args={[positions.colors, 3]} attach="attributes-color" array={positions.colors} itemSize={3} />
          <bufferAttribute args={[positions.sizes, 1]} attach="attributes-size" array={positions.sizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <Html
        transform
        position={[0, -3.5, 0]}
        style={{
          opacity: introOpacity,
          pointerEvents: "none",
          transform: `translate(-50%, -50%) scale(${0.9 + sectionProgress * 0.1})`,
        }}
      >
        <div
          style={{
            fontSize: "clamp(1.5rem, 4vw, 3rem)",
            fontWeight: 700,
            background: "linear-gradient(135deg, #6c5ce7, #a29bfe, #fbbf24)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            whiteSpace: "nowrap",
            textShadow: "0 0 40px rgba(108,92,231,0.5)",
          }}
        >
          SCROLL TO BEGIN
        </div>
      </Html>
    </group>
  )
}