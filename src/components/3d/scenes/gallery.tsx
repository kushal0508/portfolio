"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"
import { useScrollState } from "@/lib/scroll-provider"
import type { DeviceTier } from "@/lib/device-detect"

const PRIMARY = "#6c5ce7"
const ACCENT = "#fbbf24"
const GLOW = "#a29bfe"
const CYAN = "#00cec9"

const random = Math.random

export function GalleryScene({ deviceTier = "high" }: { deviceTier?: DeviceTier }) {
  const { progress } = useScrollState()
  const sectionProgress = Math.max(0, Math.min(1, (progress - 0.5) / 0.125))
  const intensity = Math.max(0, 1 - Math.abs(progress - 0.5625) / 0.0625)

  return (
    <group scale={intensity}>
      <GalleryHall sectionProgress={sectionProgress} deviceTier={deviceTier} />
      <ProjectDisplays sectionProgress={sectionProgress} deviceTier={deviceTier} />
      <GalleryLighting sectionProgress={sectionProgress} deviceTier={deviceTier} />
      <GalleryParticles sectionProgress={sectionProgress} deviceTier={deviceTier} />
    </group>
  )
}

function GalleryHall({ sectionProgress, deviceTier }: { sectionProgress: number; deviceTier: DeviceTier }) {
  const isLow = deviceTier === "low"
  const wallGeometry = useMemo(() => new THREE.BoxGeometry(20, 10, 0.2), [])
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(24, 50), [])
  const pillarGeometry = useMemo(() => new THREE.CylinderGeometry(0.4, 0.4, 10, isLow ? 8 : 16), [isLow])

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0e0e20",
        metalness: 0.5,
        roughness: 0.3,
        envMapIntensity: 0.8,
      }),
    [],
  )

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0a0a18",
        metalness: 0.8,
        roughness: 0.15,
        envMapIntensity: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    [],
  )

  const pillarMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#1a1a3a",
        metalness: 0.7,
        roughness: 0.25,
        envMapIntensity: 1,
      }),
    [],
  )

  return (
    <group position={[0, 0, -74]}>
      <mesh
        position={[0, 5, -25]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[sectionProgress, 1, 1]}
        castShadow
        receiveShadow
      >
        <primitive object={wallGeometry} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      <mesh
        position={[0, 5, 25]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[sectionProgress, 1, 1]}
        castShadow
        receiveShadow
      >
        <primitive object={wallGeometry} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={sectionProgress}
        receiveShadow
      >
        <primitive object={floorGeometry} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={sectionProgress}
      >
        <planeGeometry args={[24, 50]} />
        <meshPhysicalMaterial
          color="#0a0a18"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={2}
          transparent
          opacity={0.4 * sectionProgress}
        />
      </mesh>

      {[-9.5, 9.5].map((x) =>
        [-20, -5, 10, 25].map((z, i) => (
          <Float key={`${x}-${z}`} speed={1.5 + i * 0.2} floatIntensity={0.05}>
            <mesh
              position={[x, 5, z]}
              scale={sectionProgress}
              castShadow
              receiveShadow
            >
              <primitive object={pillarGeometry} />
              <primitive object={pillarMaterial} attach="material" />
            </mesh>
          </Float>
        ))
      )}
    </group>
  )
}

function ProjectDisplays({ sectionProgress, deviceTier }: { sectionProgress: number; deviceTier: DeviceTier }) {
  const isLow = deviceTier === "low"
  const projects = useMemo(
    () => [
      { id: 1, title: "WerWoods", color: "#f59e0b", tags: ["Odoo ERP", "E-commerce"] },
      { id: 2, title: "Nutrition System", color: "#10b981", tags: ["Odoo ERP", "Healthcare"] },
      { id: 3, title: "VIBHAV Bakery", color: "#f97316", tags: ["HTML", "CSS", "Netlify"] },
      { id: 4, title: "Marmabindhu", color: "#3b82f6", tags: ["Healthcare", "Booking"] },
      { id: 5, title: "ScrapTech", color: "#22c55e", tags: ["Recycling", "Platform"] },
    ],
    [],
  )

  return (
    <group position={[0, 0, -74]}>
      {projects.map((p, i) => {
        const x = (i % 2 - 0.5) * 8
        const z = Math.floor(i / 2) * 12 - 18
        const y = 2.5

        return (
          <Float
            key={p.id}
            speed={2 + i * 0.1}
            rotationIntensity={0.1}
            floatIntensity={0.15}
          >
            <group
              position={[x, y, z]}
              scale={sectionProgress}
            >
              <mesh
                position={[0, 0, 0.15]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[3.2, 2.2, 0.1]} />
                <meshPhysicalMaterial
                  color={p.color}
                  metalness={0.3}
                  roughness={0.2}
                  transparent
                  opacity={0.15}
                  envMapIntensity={1.5}
                />
              </mesh>

              <mesh
                position={[0, 0, 0.2]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[3.2, 2.2, 0.05]} />
                <meshPhysicalMaterial
                  color="#0a0a18"
                  metalness={0.8}
                  roughness={0.1}
                  envMapIntensity={2}
                />
              </mesh>

              <mesh
                position={[0, 0, 0.25]}
                scale={0.95}
              >
                <boxGeometry args={[3, 2, 0.02]} />
                <meshBasicMaterial
                  color={p.color}
                  transparent
                  opacity={0.1}
                  side={THREE.DoubleSide}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>

              <mesh
                position={[-1.55, 0, 0.3]}
                scale={sectionProgress}
              >
                <cylinderGeometry args={[0.02, 0.02, 2.2, isLow ? 4 : 8]} />
                <meshBasicMaterial
                  color={p.color}
                  transparent
                  opacity={0.8}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>

              <mesh
                position={[0, -1.05, 0.3]}
                scale={sectionProgress}
              >
                <cylinderGeometry args={[0.02, 0.02, 3.2, isLow ? 4 : 8]} />
                <meshBasicMaterial
                  color={p.color}
                  transparent
                  opacity={0.5}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>

              {p.tags.map((tag, ti) => (
                <mesh
                  key={tag}
                  position={[0, 0.6 - ti * 0.3, 0.4]}
                  scale={sectionProgress * 0.5}
                >
                  <planeGeometry args={[2.5, 0.25]} />
                  <meshBasicMaterial
                    color={p.color}
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>
              ))}
            </group>
          </Float>
        )
      })}
    </group>
  )
}

function GalleryLighting({ sectionProgress, deviceTier }: { sectionProgress: number; deviceTier: DeviceTier }) {
  const isLow = deviceTier === "low"
  const spots = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => {
        const row = Math.floor(i / 2)
        const col = i % 2
        return {
          x: (col - 0.5) * 8,
          y: 9,
          z: row * 12 - 18,
          color: [PRIMARY, ACCENT, GLOW, CYAN][i % 4],
          angle: (random() - 0.5) * 0.3,
        }
      }),
    [],
  )

  return (
    <group position={[0, 0, -74]}>
      {spots.map((s, i) => (
        <group key={i} position={[s.x, s.y, s.z]}>
          <spotLight
            position={[0, 0, 0]}
            target-position={[s.x, 2.5, s.z]}
            color={s.color}
            intensity={1.5 * sectionProgress}
            angle={Math.PI / 6}
            penumbra={0.5}
            decay={2}
            distance={15}
            castShadow
            shadow-mapSize-width={isLow ? 256 : 512}
            shadow-mapSize-height={isLow ? 256 : 512}
          />
          <mesh
            position={[0, 0, 0]}
            scale={0.2 * sectionProgress}
          >
            <cylinderGeometry args={[0.1, 0.15, 0.3, isLow ? 8 : 16]} />
            <meshPhysicalMaterial
              color="#1a1a3a"
              metalness={0.8}
              roughness={0.2}
              envMapIntensity={1}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function GalleryParticles({ sectionProgress, deviceTier }: { sectionProgress: number; deviceTier: DeviceTier }) {
  const isLow = deviceTier === "low"
  const count = isLow ? 250 : 600
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      arr[i3] = (random() - 0.5) * 20
      arr[i3 + 1] = random() * 10
      arr[i3 + 2] = -74 - 25 + random() * 50

      const color = new THREE.Color().setHSL(
        0.7 + random() * 0.2,
        0.6,
        0.5 + random() * 0.3,
      )
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = 0.008 + random() * 0.015
    }
    return { arr, colors, sizes }
  }, [count])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        pos[i3] += Math.sin(t * 0.2 + i) * 0.002
        pos[i3 + 1] += Math.cos(t * 0.15 + i) * 0.001
        pos[i3 + 2] += Math.sin(t * 0.1 + i) * 0.001
      }
      ref.current.geometry.attributes.position.needsUpdate = true
      ;(ref.current.material as THREE.PointsMaterial).opacity = 0.3 * sectionProgress
    }
  })

  return (
    <points ref={ref} position={[0, 0, -74]}>
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
