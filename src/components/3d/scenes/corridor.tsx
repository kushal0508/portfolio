"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useScrollState } from "@/lib/scroll-provider"

const PRIMARY = "#6c5ce7"
const ACCENT = "#fbbf24"
const GLOW = "#a29bfe"
const CYAN = "#00cec9"

const random = Math.random

export function CorridorScene() {
  const { progress } = useScrollState()
  const sectionProgress = Math.max(0, Math.min(1, (progress - 0.46) / 0.16))
  const intensity = Math.max(0, 1 - Math.abs(progress - 0.54) / 0.12)

  return (
    <group scale={intensity}>
      <CorridorArchitecture sectionProgress={sectionProgress} />
      <EnergyConduits sectionProgress={sectionProgress} />
      <DataParticles sectionProgress={sectionProgress} />
      <HolographicDisplays sectionProgress={sectionProgress} />
    </group>
  )
}

function CorridorArchitecture({ sectionProgress }: { sectionProgress: number }) {
  const arches = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        z: -54 - i * 6,
        width: 6 + Math.sin(i * 0.5) * 1,
        height: 7 + Math.cos(i * 0.3) * 0.5,
        rotation: (Math.sin(i * 0.7) - 0.5) * 0.15,
      })),
    [],
  )

  return (
    <group position={[0, 0, -54]}>
      {arches.map((a, i) => (
        <group key={i} position={[0, 0, a.z + 54]} rotation={[0, 0, a.rotation]}>
          <mesh
            position={[-a.width / 2, a.height / 2, 0]}
            scale={sectionProgress}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.4, a.height, 0.6]} />
            <meshPhysicalMaterial
              color="#1a1a3a"
              metalness={0.7}
              roughness={0.25}
              envMapIntensity={0.8}
            />
          </mesh>
          <mesh
            position={[a.width / 2, a.height / 2, 0]}
            scale={sectionProgress}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.4, a.height, 0.6]} />
            <meshPhysicalMaterial
              color="#1a1a3a"
              metalness={0.7}
              roughness={0.25}
              envMapIntensity={0.8}
            />
          </mesh>
          <mesh
            position={[0, a.height, 0]}
            scale={sectionProgress}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[a.width + 0.8, 0.4, 0.6]} />
            <meshPhysicalMaterial
              color="#1a1a3a"
              metalness={0.7}
              roughness={0.25}
              envMapIntensity={0.8}
            />
          </mesh>

          <mesh
            position={[0, a.height * 0.7, 0.3]}
            rotation={[0, 0, Math.PI / 2]}
            scale={sectionProgress}
          >
            <cylinderGeometry args={[0.02, 0.02, a.width + 0.4, 8]} />
            <meshBasicMaterial
              color={PRIMARY}
              transparent
              opacity={0.6 * sectionProgress}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      <mesh
        position={[0, -2, -36]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={sectionProgress}
        receiveShadow
      >
        <planeGeometry args={[12, 80]} />
        <meshPhysicalMaterial
          color="#0a0a18"
          metalness={0.6}
          roughness={0.4}
          envMapIntensity={0.5}
        />
      </mesh>

      <mesh
        position={[0, -2, -36]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={sectionProgress}
      >
        <planeGeometry args={[12, 80]} />
        <meshPhysicalMaterial
          color="#0a0a18"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.5}
          transparent
          opacity={0.3 * sectionProgress}
        />
      </mesh>
    </group>
  )
}

function EnergyConduits({ sectionProgress }: { sectionProgress: number }) {
  const conduits = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({
        side: i % 2 === 0 ? -1 : 1,
        offset: 3.5 + Math.floor(i / 2) * 0.5,
        color: [PRIMARY, ACCENT, GLOW, CYAN][i],
        phase: i * 1.2,
        speed: 0.5 + i * 0.1,
      })),
    [],
  )

  return (
    <group position={[0, 0, -54]}>
      {conduits.map((c, i) => (
        <mesh
          key={i}
          position={[c.side * c.offset, 2.5, 0]}
          scale={[1, 1, sectionProgress * 50]}
        >
          <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
          <meshBasicMaterial
            color={c.color}
            transparent
            opacity={0.4 * sectionProgress}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function DataParticles({ sectionProgress }: { sectionProgress: number }) {
  const count = 800
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const initZ = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const side = random() > 0.5 ? 1 : -1
      arr[i3] = side * (3.5 + random() * 4)
      arr[i3 + 1] = random() * 6
      arr[i3 + 2] = -54 - 50 + random() * 100

      initZ[i] = arr[i3 + 2]

      const color = new THREE.Color().setHSL(
        0.65 + random() * 0.25,
        0.7,
        0.4 + random() * 0.3,
      )
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = 0.01 + random() * 0.02
    }
    return { arr, colors, sizes, initZ }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        pos[i3] = positions.arr[i3] + Math.sin(t * 0.5 + i * 0.01) * 0.3
        pos[i3 + 1] = positions.initZ[i] + Math.cos(t * 0.3 + i * 0.01) * 0.2
        pos[i3 + 2] = positions.arr[i3 + 2] + Math.sin(t * 0.1 + i * 0.005) * 0.5
      }
      ref.current.geometry.attributes.position.needsUpdate = true
      ;(ref.current.material as THREE.PointsMaterial).opacity = 0.4 * sectionProgress
    }
  })

  return (
    <points ref={ref} position={[0, 0, -54]}>
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

function HolographicDisplays({ sectionProgress }: { sectionProgress: number }) {
  const displays = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        z: -54 - 5 - i * 8,
        side: i % 2 === 0 ? -1 : 1,
        color: [PRIMARY, ACCENT, GLOW, CYAN][i % 4],
        width: 2.5,
        height: 1.8,
      })),
    [],
  )

  return (
    <group position={[0, 0, -54]}>
      {displays.map((d, i) => (
        <group key={i} position={[d.side * 4.5, 3.5, d.z + 54]}>
          <mesh
            position={[0, 0, 0]}
            scale={sectionProgress}
            rotation={[0, d.side * -0.3, 0]}
          >
            <planeGeometry args={[d.width, d.height]} />
            <meshBasicMaterial
              color={d.color}
              transparent
              opacity={0.15 * sectionProgress}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          <mesh
            position={[0, 0, 0.02]}
            scale={sectionProgress}
            rotation={[0, d.side * -0.3, 0]}
          >
            <planeGeometry args={[d.width * 0.9, d.height * 0.9]} />
            <meshBasicMaterial
              color={d.color}
              transparent
              opacity={0.3 * sectionProgress}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}