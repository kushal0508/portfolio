"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Float, Html } from "@react-three/drei"
import * as THREE from "three"
import { useScrollState } from "@/lib/scroll-provider"
import type { DeviceTier } from "@/lib/device-detect"

const PRIMARY = "#6c5ce7"
const ACCENT = "#fbbf24"
const GLOW = "#a29bfe"
const CYAN = "#00cec9"
const ROSE = "#fd79a8"

const random = Math.random

const SKILL_CATEGORIES = [
  { name: "Frontend", color: PRIMARY, icon: "layout", count: 5 },
  { name: "Programming", color: CYAN, icon: "code", count: 3 },
  { name: "Tools & Platforms", color: ACCENT, icon: "wrench", count: 4 },
  { name: "ERP & Systems", color: GLOW, icon: "database", count: 1 },
  { name: "Design & Marketing", color: ROSE, icon: "palette", count: 3 },
]

export function TechPlanets({ deviceTier = "high" }: { deviceTier?: DeviceTier }) {
  const { progress } = useScrollState()
  const groupRef = useRef<THREE.Group>(null)

  const isLow = deviceTier === "low"

  const planets = useMemo(() => {
    return SKILL_CATEGORIES.map((cat, i) => {
      const angle = (i / SKILL_CATEGORIES.length) * Math.PI * 2
      const radius = 12
      return {
        ...cat,
        angle,
        radius,
        x: Math.cos(angle) * radius,
        y: (i % 3 - 1) * 2.5,
        z: Math.sin(angle) * radius - 35,
        size: isLow ? 1 : (1.2 + (cat.count / 5) * 0.6),
        rotationSpeed: 0.02 + i * 0.005,
        orbitSpeed: 0.01 + i * 0.002,
        initialAngle: angle,
        satellites: cat.count,
      }
    })
  }, [isLow])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const sectionProgress = Math.max(0, Math.min(1, (progress - 0.3) / 0.16))

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.008
    }

    planets.forEach((p, i) => {
      const mesh = groupRef.current?.children[i] as THREE.Mesh | undefined
      if (mesh) {
        const orbitAngle = p.initialAngle + t * p.orbitSpeed
        mesh.position.x = Math.cos(orbitAngle) * (8 + i * 2.5)
        mesh.position.z = Math.sin(orbitAngle) * (8 + i * 2.5) - 35
        mesh.rotation.y += p.rotationSpeed
      }

      const satellites = groupRef.current?.children[i + planets.length] as THREE.Group | undefined
      if (satellites) {
        satellites.rotation.y += 0.02
        satellites.rotation.x += 0.005
        satellites.scale.setScalar(0.8 + sectionProgress * 0.4)
      }
    })
  })

  const intensity = Math.max(0, 1 - Math.abs(progress - 0.38) / 0.12)

  return (
    <group ref={groupRef} position={[0, 0, -34]} scale={intensity}>
      {planets.map((p, i) => (
        <SkillPlanet key={i} planet={p} progress={progress} deviceTier={deviceTier} />
      ))}
      {planets.map((p, i) => (
        <SkillSatellites key={`sat-${i}`} planet={p} progress={progress} deviceTier={deviceTier} />
      ))}
      <SkillParticleField progress={progress} deviceTier={deviceTier} />
    </group>
  )
}

function SkillPlanet({
  planet,
  progress,
  deviceTier,
}: {
  planet: (typeof SKILL_CATEGORIES)[0] & {
    angle: number
    radius: number
    x: number
    y: number
    z: number
    size: number
    satellites: number
  }
  progress: number
  deviceTier?: DeviceTier
}) {
  const ref = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Group>(null)
  const sectionProgress = Math.max(0, Math.min(1, (progress - 0.3) / 0.16))
  const isLow = deviceTier === "low"

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y += 0.005
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.01
      ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.2
    }
  })

  const segments = deviceTier === "low" ? 16 : 32
  const ringSegments = deviceTier === "low" ? 8 : 16

  return (
    <group position={[planet.x, planet.y, planet.z]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={ref} castShadow receiveShadow>
          <sphereGeometry args={[planet.size, segments, segments]} />
          <meshPhysicalMaterial
            color={planet.color}
            metalness={0.5}
            roughness={0.15}
            clearcoat={isLow ? 0 : 1}
            clearcoatRoughness={0.1}
            transmission={isLow ? 0 : 0.1}
            thickness={0.5}
            envMapIntensity={deviceTier === "low" ? 0.5 : 1.5}
          />
        </mesh>
      </Float>

      <group ref={ringRef}>
        {Array.from({ length: 2 }).map((_, r) => (
          <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[planet.size * (1.4 + r * 0.3), 0.03, ringSegments, 64]} />
            <meshBasicMaterial
              color={planet.color}
              transparent
              opacity={0.2 * sectionProgress}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      <Html
        transform
        position={[0, -planet.size - 1.5, 0]}
        style={{
          opacity: sectionProgress,
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: planet.color,
            textShadow: `0 0 20px ${planet.color}`,
            whiteSpace: "nowrap",
          }}
        >
          {planet.name}
        </div>
      </Html>
    </group>
  )
}

function SkillSatellites({
  planet,
  progress,
  deviceTier,
}: {
  planet: (typeof SKILL_CATEGORIES)[0] & { angle: number; radius: number; x: number; y: number; z: number; size: number; satellites: number }
  progress: number
  deviceTier?: DeviceTier
}) {
  const sectionProgress = Math.max(0, Math.min(1, (progress - 0.3) / 0.16))
  const isLow = deviceTier === "low"
  const satellites = useMemo(
    () =>
      Array.from({ length: planet.satellites }).map((_, i) => {
        const satAngle = (i / planet.satellites) * Math.PI * 2
        const satRadius = planet.size * 1.8
        return {
          angle: satAngle,
          radius: satRadius,
          size: 0.15 + random() * 0.1,
          color: planet.color,
          orbitSpeed: 0.3 + i * 0.1,
          initialAngle: satAngle,
          height: (random() - 0.5) * 0.5,
        }
      }),
    [planet]
  )

  return (
    <group position={[planet.x, planet.y, planet.z]}>
      {satellites.map((sat, i) => (
        <Float key={i} speed={2 + i * 0.2} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh
            position={[
              Math.cos(sat.initialAngle) * sat.radius,
              sat.height,
              Math.sin(sat.initialAngle) * sat.radius,
            ]}
            scale={sectionProgress}
            rotation={[0, 0, 0]}
          >
            <icosahedronGeometry args={[sat.size, 1]} />
            <meshPhysicalMaterial
              color={sat.color}
              emissive={sat.color}
              emissiveIntensity={1}
              metalness={0.4}
              roughness={0.2}
              transparent
              opacity={0.8 * sectionProgress}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function SkillParticleField({ progress, deviceTier }: { progress: number; deviceTier?: DeviceTier }) {
  const sectionProgress = Math.max(0, Math.min(1, (progress - 0.3) / 0.16))
  const isLow = deviceTier === "low"
  const count = isLow ? 400 : 1500
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 10 + random() * 25
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)

      arr[i3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      arr[i3 + 2] = radius * Math.cos(phi) - 35

      const cat = SKILL_CATEGORIES[Math.floor(random() * SKILL_CATEGORIES.length)]
      const color = new THREE.Color(cat.color)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = 0.01 + random() * 0.03
      velocities[i3] = (random() - 0.5) * 0.0005
      velocities[i3 + 1] = (random() - 0.5) * 0.0005
      velocities[i3 + 2] = (random() - 0.5) * 0.0005
    }
    return { arr, colors, sizes, velocities }
  }, [count])

  useFrame(({ clock }) => {
    const dt = clock.getDelta()
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        pos[i3] += positions.velocities[i3] * 60 * dt
        pos[i3 + 1] += positions.velocities[i3 + 1] * 60 * dt
        pos[i3 + 2] += positions.velocities[i3 + 2] * 60 * dt
      }
      ref.current.geometry.attributes.position.needsUpdate = true
      ;(ref.current.material as THREE.PointsMaterial).opacity = 0.3 * sectionProgress
    }
  })

  return (
    <points ref={ref}>
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