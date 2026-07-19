"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"
import { useScrollState } from "@/lib/scroll-provider"

const random = Math.random

const PRIMARY = "#6c5ce7"
const ACCENT = "#fbbf24"
const GLOW = "#a29bfe"
const CYAN = "#00cec9"
const ROSE = "#fd79a8"

export function ChamberScene() {
  const { progress } = useScrollState()
  const sectionProgress = Math.max(0, Math.min(1, (progress - 0.78) / 0.12))
  const intensity = Math.max(0, 1 - Math.abs(progress - 0.84) / 0.12)

  return (
    <group scale={intensity} position={[0, 0, -94]}>
      <ChamberHall sectionProgress={sectionProgress} />
      <AchievementCrystals sectionProgress={sectionProgress} />
      <ChamberAtmosphere sectionProgress={sectionProgress} />
      <ChamberLighting sectionProgress={sectionProgress} />
    </group>
  )
}

function ChamberHall({ sectionProgress }: { sectionProgress: number }) {
  const columnGeometry = useMemo(() => new THREE.CylinderGeometry(0.6, 0.6, 14, 12), [])
  const archGeometry = useMemo(() => new THREE.TorusGeometry(4, 0.3, 8, 32, Math.PI), [])
  const floorGeometry = useMemo(() => new THREE.CircleGeometry(15, 64), [])

  const columnMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#1a1a3a",
        metalness: 0.7,
        roughness: 0.25,
        envMapIntensity: 1,
      }),
    [],
  )

  const archMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: PRIMARY,
        metalness: 0.5,
        roughness: 0.2,
        emissive: PRIMARY,
        emissiveIntensity: 0.5,
        envMapIntensity: 1.5,
      }),
    [],
  )

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0a0a18",
        metalness: 0.8,
        roughness: 0.1,
        envMapIntensity: 2,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
    [],
  )

  return (
    <group>
      {[-7, 0, 7].map((x) =>
        [0, 1].map((side) => (
          <mesh
            key={`${x}-${side}`}
            position={[x, 0, side * 8]}
            scale={sectionProgress}
            castShadow
            receiveShadow
          >
            <primitive object={columnGeometry} />
            <primitive object={columnMaterial} attach="material" />
          </mesh>
        ))
      )}

      {[-4, 4].map((x) => (
        <mesh
          key={x}
          position={[x, 7, 4]}
          rotation={[0, 0, Math.PI / 2]}
          scale={sectionProgress}
        >
          <primitive object={archGeometry} />
          <primitive object={archMaterial} attach="material" />
        </mesh>
      ))}

      <mesh
        position={[0, -7, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={sectionProgress * 1.5}
        receiveShadow
      >
        <primitive object={floorGeometry} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>
    </group>
  )
}

function AchievementCrystals({ sectionProgress }: { sectionProgress: number }) {
  const achievements = useMemo(
    () => [
      { id: 1, color: PRIMARY, pos: [-4, 3, -3] as [number, number, number] },
      { id: 2, color: ACCENT, pos: [4, 2.5, -5] as [number, number, number] },
      { id: 3, color: GLOW, pos: [-3, 4, 3] as [number, number, number] },
      { id: 4, color: ROSE, pos: [3, 3.5, 5] as [number, number, number] },
    ],
    [],
  )

  return (
    <group>
      {achievements.map((a, i) => (
        <Float
          key={a.id}
          speed={1.2 + i * 0.15}
          rotationIntensity={0.3}
          floatIntensity={0.4}
        >
          <group position={a.pos} scale={sectionProgress}>
            <mesh castShadow receiveShadow>
              <octahedronGeometry args={[1.2, 0]} />
              <meshPhysicalMaterial
                color={a.color}
                metalness={0.4}
                roughness={0.1}
                transmission={0.4}
                thickness={0.5}
                ior={1.4}
                clearcoat={1}
                clearcoatRoughness={0.05}
                envMapIntensity={2}
                emissive={a.color}
                emissiveIntensity={0.5}
              />
            </mesh>

            <mesh scale={1.1}>
              <octahedronGeometry args={[1.2, 0]} />
              <meshBasicMaterial
                color={a.color}
                wireframe
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            <mesh scale={1.5}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshBasicMaterial
                color={a.color}
                transparent
                opacity={0.05}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {Array.from({ length: 3 }).map((_, r) => (
              <mesh
                key={r}
                position={[0, 0, 0]}
                rotation={[Math.PI / 2, 0, (r / 3) * Math.PI * 2]}
                scale={1 + r * 0.3}
              >
                <torusGeometry args={[1.5 + r * 0.5, 0.02, 16, 64]} />
                <meshBasicMaterial
                  color={a.color}
                  transparent
                  opacity={0.15 * (1 - r * 0.2)}
                  side={THREE.DoubleSide}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        </Float>
      ))}
    </group>
  )
}

function ChamberAtmosphere({ sectionProgress }: { sectionProgress: number }) {
  const count = 1500
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const initY = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = random() * 10
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)

      arr[i3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) - 2
      arr[i3 + 2] = radius * Math.cos(phi)

      initY[i] = arr[i3 + 1]

      const color = new THREE.Color().setHSL(
        0.7 + random() * 0.2,
        0.6,
        0.4 + random() * 0.3,
      )
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = 0.01 + random() * 0.03
    }
    return { arr, colors, sizes, initY }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        pos[i3] = positions.arr[i3] + Math.sin(t * 0.2 + i * 0.01) * 0.5
        pos[i3 + 1] = positions.initY[i] + Math.cos(t * 0.15 + i * 0.01) * 0.3
        pos[i3 + 2] = positions.arr[i3 + 2] + Math.sin(t * 0.1 + i * 0.005) * 0.3
      }
      ref.current.geometry.attributes.position.needsUpdate = true
      ;(ref.current.material as THREE.PointsMaterial).opacity = 0.5 * sectionProgress
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

function ChamberLighting({ sectionProgress }: { sectionProgress: number }) {
  const lights = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => {
        const intensity = 1.5 + random() * 0.5
        return {
          angle: (i / 6) * Math.PI * 2,
          radius: 6,
          height: 5 + i * 0.5,
          color: [PRIMARY, ACCENT, GLOW, ROSE, CYAN, PRIMARY][i],
          intensity,
        }
      }),
    [],
  )

  return (
    <group>
      {lights.map((l, i) => (
        <group key={i} position={[Math.cos(l.angle) * l.radius, l.height, Math.sin(l.angle) * l.radius]}>
          <spotLight
            position={[0, 0, 0]}
            target-position={[Math.cos(l.angle) * l.radius, 0, Math.sin(l.angle) * l.radius]}
            color={l.color}
            intensity={l.intensity * sectionProgress}
            angle={Math.PI / 4}
            penumbra={0.5}
            decay={2}
            distance={20}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <mesh
            position={[0, 0, 0]}
            scale={0.3 * sectionProgress}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial
              color={l.color}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}