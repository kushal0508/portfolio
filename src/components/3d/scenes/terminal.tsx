"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { useScrollState } from "@/lib/scroll-provider"

const ACCENT = "#fbbf24"
const CYAN = "#00cec9"
const GREEN = "#00ff88"

const random = Math.random

export function TerminalScene() {
  const { progress } = useScrollState()
  const sectionProgress = Math.max(0, Math.min(1, (progress - 0.75) / 0.25))
  const intensity = Math.max(0, 1 - Math.abs(progress - 0.875) / 0.125)

  return (
    <group scale={intensity} position={[0, 0, -114]}>
      <TerminalArchitecture sectionProgress={sectionProgress} />
      <CodeStream sectionProgress={sectionProgress} />
      <TerminalMonitors sectionProgress={sectionProgress} />
      <TerminalParticles sectionProgress={sectionProgress} />
      <TerminalLighting sectionProgress={sectionProgress} />
    </group>
  )
}

function TerminalArchitecture({ sectionProgress }: { sectionProgress: number }) {
  const deskGeometry = useMemo(() => new THREE.BoxGeometry(16, 1.2, 8), [])
  const monitorBaseGeometry = useMemo(() => new THREE.CylinderGeometry(0.5, 0.8, 0.3, 16), [])
  const monitorStandGeometry = useMemo(() => new THREE.BoxGeometry(0.15, 0.8, 0.15), [])

  const deskMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0a0a12",
        metalness: 0.7,
        roughness: 0.2,
        envMapIntensity: 1.5,
      }),
    [],
  )

  const metalMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#1a1a2e",
        metalness: 0.85,
        roughness: 0.15,
        envMapIntensity: 1,
      }),
    [],
  )

  return (
    <group>
      <mesh
        position={[0, -2.5, 0]}
        scale={sectionProgress}
        receiveShadow
      >
        <primitive object={deskGeometry} />
        <primitive object={deskMaterial} attach="material" />
      </mesh>

      {[-6, 0, 6].map((x) => (
        <group key={x} position={[x, -1.9, 1.5]}>
          <mesh scale={sectionProgress} castShadow>
            <primitive object={monitorBaseGeometry} />
            <primitive object={metalMaterial} attach="material" />
          </mesh>
          <mesh
            position={[0, 0.55, 0]}
            scale={sectionProgress}
            castShadow
          >
            <primitive object={monitorStandGeometry} />
            <primitive object={metalMaterial} attach="material" />
          </mesh>
        </group>
      ))}

      <mesh
        position={[0, 5.5, -2]}
        rotation={[0, 0, 0]}
        scale={sectionProgress * 12}
      >
        <planeGeometry args={[1, 0.6]} />
        <meshPhysicalMaterial
          color="#0a0a12"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={2}
          transparent
          opacity={0.3 * sectionProgress}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

function CodeStream({ sectionProgress }: { sectionProgress: number }) {
  const streams = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        x: -7 + i * 3.5,
        y: 1.5,
        z: 2,
        speed: 0.3 + i * 0.05,
        phase: i * 1.5,
        color: i % 2 === 0 ? GREEN : CYAN,
        chars: Array.from({ length: 30 }).map(() =>
          String.fromCharCode(0x30 + Math.floor(Math.random() * 100))
        ),
      })),
    [],
  )

  return (
    <group>
      {streams.map((s, i) => (
        <CodeColumn key={i} stream={s} sectionProgress={sectionProgress} />
      ))}
    </group>
  )
}

function CodeColumn({
  stream,
  sectionProgress,
}: {
  stream: { x: number; y: number; z: number; speed: number; phase: number; color: string; chars: string[] }
  sectionProgress: number
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.children.forEach((child, idx) => {
        if (child instanceof THREE.Mesh) {
          child.position.y = stream.y + Math.sin(t * stream.speed + stream.phase + idx * 0.5) * 0.5
          child.material.opacity = (0.4 + Math.sin(t * 2 + idx) * 0.2) * sectionProgress
        }
      })
    }
  })

  return (
    <group ref={ref} position={[stream.x, stream.y, stream.z]}>
      {stream.chars.map((char, idx) => (
        <Html
          key={idx}
          transform
          position={[0, idx * 0.3, 0]}
          style={{
            opacity: sectionProgress,
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
            fontSize: "0.35rem",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            color: stream.color,
            textShadow: `0 0 8px ${stream.color}`,
            whiteSpace: "nowrap",
          }}
        >
          {char}
        </Html>
      ))}
    </group>
  )
}

function TerminalMonitors({ sectionProgress }: { sectionProgress: number }) {
  const monitors = useMemo(
    () =>
      [-6, 0, 6].map((x, i) => ({
        x,
        screenWidth: 4.5,
        screenHeight: 2.5,
        z: 2,
        color: [GREEN, CYAN, GREEN][i],
        title: ["CODE", "TERMINAL", "DEPLOY"][i],
      })),
    [],
  )

  return (
    <group>
      {monitors.map((m, i) => (
        <group key={i} position={[m.x, 1.5, m.z]}>
          <mesh
            position={[0, 0, 0]}
            scale={sectionProgress}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[m.screenWidth, m.screenHeight, 0.1]} />
            <meshPhysicalMaterial
              color="#000800"
              metalness={0.5}
              roughness={0.2}
              envMapIntensity={1}
            />
          </mesh>

          <mesh
            position={[0, 0, 0.06]}
            scale={sectionProgress}
          >
            <planeGeometry args={[m.screenWidth * 0.95, m.screenHeight * 0.95]} />
            <meshBasicMaterial
              color={m.color}
              transparent
              opacity={0.05 * sectionProgress}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          <Html
            transform
            position={[0, m.screenHeight * 0.4, 0.1]}
            style={{
              opacity: sectionProgress,
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: m.color,
                textShadow: `0 0 20px ${m.color}`,
                letterSpacing: "0.2em",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {m.title}
            </div>
          </Html>

          <Html
            transform
            position={[0, -m.screenHeight * 0.35, 0.1]}
            style={{
              opacity: sectionProgress * 0.7,
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                fontSize: "0.6rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: m.color,
                lineHeight: 1.6,
                textAlign: "left",
                width: "300px",
              }}
            >
              {m.title === "CODE" && (
                <>
                  <div>{'>'} npm run dev</div>
                  <div>{'>'} Starting development server...</div>
                  <div style={{ color: GREEN }}>{'>'} Ready on http://localhost:3000</div>
                  <div>{'>'} Compiling...</div>
                  <div style={{ color: ACCENT }}>{'>'} 42 modules transformed</div>
                </>
              )}
              {m.title === "TERMINAL" && (
                <>
                  <div>kushal@portfolio:~$</div>
                  <div>{'>'} git status</div>
                  <div style={{ color: GREEN }}>{'>'} On branch main</div>
                  <div>{'>'} Your branch is up to date</div>
                  <div>{'>'} nothing to commit, working tree clean</div>
                </>
              )}
              {m.title === "DEPLOY" && (
                <>
                  <div>{'>'} vercel deploy</div>
                  <div>{'>'} Building...</div>
                  <div style={{ color: GREEN }}>{'>'} Build completed</div>
                  <div>{'>'} Deploying to production...</div>
                  <div style={{ color: ACCENT }}>{'>'} https://kushalr.dev &check;</div>
                </>
              )}
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

function TerminalParticles({ sectionProgress }: { sectionProgress: number }) {
  const count = 1000
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      arr[i3] = (random() - 0.5) * 20
      arr[i3 + 1] = -2 + random() * 8
      arr[i3 + 2] = -114 - 5 + random() * 10

      const isGreen = random() > 0.5
      const color = new THREE.Color(isGreen ? GREEN : CYAN)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = 0.01 + random() * 0.03
      velocities[i3] = (random() - 0.5) * 0.002
      velocities[i3 + 1] = (random() - 0.5) * 0.002
      velocities[i3 + 2] = (random() - 0.5) * 0.002
    }
    return { arr, colors, sizes, velocities }
  }, [])

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
      ;(ref.current.material as THREE.PointsMaterial).opacity = 0.4 * sectionProgress
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

function TerminalLighting({ sectionProgress }: { sectionProgress: number }) {
  const underGlow = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, i) => ({
        x: -6 + i * 6,
        z: 2.5,
        color: i % 2 === 0 ? GREEN : CYAN,
      })),
    [],
  )

  return (
    <group>
      {underGlow.map((g, i) => (
        <group key={i} position={[g.x, -1.5, g.z]}>
          <pointLight
            position={[0, 0, 0]}
            color={g.color}
            intensity={1 * sectionProgress}
            distance={8}
            decay={2}
          />
          <mesh
            position={[0, -0.6, 0]}
            scale={sectionProgress * 4}
          >
            <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
            <meshBasicMaterial
              color={g.color}
              transparent
              opacity={0.2 * sectionProgress}
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