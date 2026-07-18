"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshReflectorMaterial, Sparkles } from "@react-three/drei"
import * as THREE from "three"
import { useScrollState, SECTION_Z } from "@/lib/scroll-provider"
import { WAYPOINTS } from "@/lib/camera-path"

const PRIMARY = "#6c5ce7"
const GLOW = "#a29bfe"
const ACCENT = "#fbbf24"
const CYAN = "#00cec9"
const ROSE = "#fd79a8"
const AMBER = "#f59e0b"
const GREEN = "#00ff88"

const SCENE_ACCENTS: Record<string, string> = {
  OPENING: PRIMARY,
  ABOUT: GLOW,
  SKILLS: CYAN,
  EXPERIENCE: ROSE,
  PROJECTS: AMBER,
  ACHIEVEMENTS: ACCENT,
  CONTACT: GREEN,
  ENDING: GREEN,
}

/**
 * The single continuous environment that stitches every discrete scene into
 * one world. Visitors never feel they "leave" a section and enter another
 * webpage because the same floor, gateway rings, beams and pathways run
 * underneath and above all of them — they merely shift color/glow per scene.
 *
 * Layers:
 *   • Reflective corridor floor (MeshReflectorMaterial)
 *   • "Light bridge" running lights under the camera path
 *   • Horizon gateway rings placed exactly at each scene's anchor Z
 *   • Tall side monoliths framing the path (instanced for perf)
 *   • Energy beams arcing between consecutive gateways overhead
 *   • Two layers of Sparkles dust for atmosphere
 */
export function ConnectedWorld({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const { progress } = useScrollState()

  return (
    <group>
      <ReflectiveFloor />
      <PathRunway reducedMotion={reducedMotion} />
      <GatewayRings reducedMotion={reducedMotion} />
      <SideMonoliths reducedMotion={reducedMotion} />
      <OverheadBeams progress={progress} reducedMotion={reducedMotion} />
      <Sparkles
        count={80}
        scale={[26, 14, 140]}
        size={2}
        speed={0.25}
        opacity={0.4}
        color={GLOW}
      />
      <Sparkles
        count={50}
        scale={[22, 12, 140]}
        size={1.4}
        speed={0.4}
        opacity={0.35}
        color={ACCENT}
      />
    </group>
  )
}

/** Premium reflective floor — the visual anchor of the whole journey. */
function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, -60]}>
      <planeGeometry args={[90, 240]} />
      <MeshReflectorMaterial
        resolution={512}
        mixBlur={1.4}
        mixStrength={1.0}
        blur={[420, 120]}
        mirror={0.5}
        depthScale={1.0}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.2}
        depthToBlurRatioBias={0.2}
        roughness={0.7}
        metalness={0.65}
        color="#080812"
        envMapIntensity={0.7}
      />
    </mesh>
  )
}

/**
 * Sub-bright runway beneath the camera path — a long thin emissive plane with
 * animated dashes that scroll opposite to camera motion, giving a constant
 * sense of forward travel even between scenes. Cheap single material.
 */
function PathRunway({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(PRIMARY) },
      uAccent: { value: new THREE.Color(ACCENT) },
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (reducedMotion) return
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.38, -60]}>
      <planeGeometry args={[3.2, 240, 1, 240]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={RUNWAY_VERT}
        fragmentShader={RUNWAY_FRAG}
      />
    </mesh>
  )
}

const RUNWAY_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const RUNWAY_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uAccent;
varying vec2 vUv;

void main() {
  // Center the brightness on the runway width and fade out to the edges.
  float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);

  // Scrolling dash pattern along the length of the path.
  float dash = sin((vUv.y * 240.0) - uTime * 6.0);
  dash = smoothstep(0.7, 0.95, dash);

  // Distance fade so far ends of the path dissolve into fog.
  float depthFade = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

  vec3 col = mix(uColor, uAccent, dash * 0.6);
  float alpha = edge * (0.18 + dash * 0.55) * depthFade;
  gl_FragColor = vec4(col, alpha);
}
`

/**
 * Horizon gateway rings placed at every waypoint's anchor Z. Each ring is
 * emissive in its scene's accent color, so as the camera flies through, it
 * passes rings that subtly re-color the journey — a "portal" feel without
 * disconnected sections.
 */
function GatewayRings({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null)
  const ringRefs = useRef<THREE.Mesh[]>([])
  const matRefs = useRef<THREE.MeshBasicMaterial[]>([])

  const rings = useMemo(() => {
    return WAYPOINTS.map((w, i) => ({
      z: w.pos[2],
      radius: 5.2,
      color: SCENE_ACCENTS[w.key] ?? PRIMARY,
      index: i,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < rings.length; i++) {
      const mat = matRefs.current[i]
      if (mat) {
        // Slow pulse, slightly offset per ring so the world breathes.
        mat.opacity = 0.18 + (Math.sin(t * 0.7 + i) * 0.5 + 0.5) * 0.18
      }
      const mesh = ringRefs.current[i]
      if (mesh) {
        mesh.rotation.z = t * 0.04 + i
      }
    }
  })

  return (
    <group ref={group}>
      {rings.map((r, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringRefs.current[i] = el }}
          position={[0, 1.6, r.z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[r.radius, 0.06, 12, 80]} />
          <meshBasicMaterial
            ref={(el) => { if (el) matRefs.current[i] = el }}
            color={r.color}
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* A thin inner ring for a sharper "portal" silhouette. */}
      {rings.map((r, i) => (
        <mesh key={`inner-${i}`} position={[0, 1.6, r.z]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r.radius - 0.16, r.radius - 0.10, 80]} />
          <meshBasicMaterial
            color={r.color}
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Instanced tall side monoliths framing the path on both sides — receding
 * into fog gives continuous parallax and makes the journey feel like it runs
 * through actual architecture rather than empty space.
 */
function SideMonoliths({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const placements = useMemo(() => {
    const out: { pos: [number, number, number]; scale: [number, number, number]; rotY: number; accent: string }[] = []
    const count = 22
    const keys = Object.keys(SECTION_Z) as (keyof typeof SECTION_Z)[]
    for (let c = 0; c < count; c++) {
      const z = 12 - c * 6.5
      const side = c % 2 === 0 ? 1 : -1
      const lateral = 4.5 + ((c % 3) * 1.3)
      const height = 4.5 + ((c % 4) * 1.6)
      // Approximate nearest scene accent by z.
      let accent = PRIMARY
      let best = Infinity
      for (const k of keys) {
        const dz = Math.abs(SECTION_Z[k] - z)
        if (dz < best) {
          best = dz
          accent = SCENE_ACCENTS[k] ?? PRIMARY
        }
      }
      out.push({
        pos: [side * lateral, height / 2 - 2.4, z],
        scale: [0.5, height, 0.5],
        rotY: side * 0.04 + (c % 5) * 0.01,
        accent,
      })
    }
    return out
  }, [])

  // Metallic bodies only — accent color is added by <AccentSpines/> below so
  // we don't need a costly second instanced pass.
  useFrame(({ clock }) => {
    if (reducedMotion) return
    if (!ref.current) return
    const t = clock.getElapsedTime()
    placements.forEach((p, i) => {
      dummy.position.set(
        p.pos[0],
        p.pos[1] + Math.sin(t * 0.2 + i) * 0.04,
        p.pos[2],
      )
      dummy.rotation.y = p.rotY + t * 0.01
      dummy.rotation.z = Math.sin(t * 0.1 + i) * 0.01
      dummy.scale.set(p.scale[0], p.scale[1], p.scale[2])
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh
        ref={ref}
        args={[undefined as never, undefined as never, placements.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#10102a"
          metalness={0.85}
          roughness={0.28}
          envMapIntensity={0.7}
        />
      </instancedMesh>

      <AccentSpines reducedMotion={reducedMotion} />
    </group>
  )
}

/**
 * Thin emissive accent spines running along the corridor edges — a constant
 * "energy edge" that visually ties sections together.
 */
function AccentSpines({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const left = useRef<THREE.Mesh>(null)
  const right = useRef<THREE.Mesh>(null)
  const matL = useRef<THREE.MeshBasicMaterial>(null)
  const matR = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.getElapsedTime()
    const pulse = 0.5 + Math.sin(t * 1.2) * 0.15
    if (matL.current) {
      matL.current.opacity = 0.45 * pulse
    }
    if (matR.current) {
      matR.current.opacity = 0.45 * (1 - Math.sin(t * 1.2) * 0.15)
    }
  })

  return (
    <group>
      <mesh ref={left} position={[-4.2, -0.4, -60]}>
        <boxGeometry args={[0.04, 0.04, 240]} />
        <meshBasicMaterial
          ref={matL}
          color={PRIMARY}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={right} position={[4.2, -0.4, -60]}>
        <boxGeometry args={[0.04, 0.04, 240]} />
        <meshBasicMaterial
          ref={matR}
          color={ACCENT}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * Overhead energy beams that arc between consecutive gateway Z positions,
 * forming a connected "ceiling of light" above the path. Beams curve gently
 * using TubeGeometry along a quadratic bezier, and pulse with travel.
 */
function OverheadBeams({ progress, reducedMotion = false }: { progress: number; reducedMotion?: boolean }) {
  const beams = useMemo(() => {
    const pts = WAYPOINTS
    const out: {
      start: THREE.Vector3
      end: THREE.Vector3
      color: string
      key: string
    }[] = []
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      out.push({
        start: new THREE.Vector3(a.pos[0] * 0.4, 8 + Math.sin(i) * 0.4, a.pos[2]),
        end: new THREE.Vector3(b.pos[0] * 0.4, 8 + Math.sin(i + 1) * 0.4, b.pos[2]),
        color: SCENE_ACCENTS[b.key] ?? PRIMARY,
        key: `${a.key}-${b.key}`,
      })
    }
    return out
  }, [])

  const matRefs = useRef<THREE.MeshBasicMaterial[]>([])
  const tubeRefs = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < beams.length; i++) {
      const mat = matRefs.current[i]
      const tube = tubeRefs.current[i]
      if (mat) {
        // Each beam brightens when the camera is closest to it (midway along
        // the journey segment), then settles — guiding the visitor with light.
        const a = i / beams.length
        const b = (i + 1) / beams.length
        const mid = (a + b) / 2
        const proximity = Math.max(0, 1 - Math.abs(progress - mid) / 0.12)
        mat.opacity = 0.08 + proximity * 0.25 + Math.sin(t * 1.4 + i) * 0.03
      }
      if (tube) {
        // Tiny vertical bow for a "breathing architecture" feel.
        tube.position.y = Math.sin(t * 0.5 + i * 0.6) * 0.05
      }
    }
  })

  return (
    <group>
      {beams.map((beam, i) => {
        const curve = makeArcCurve(beam.start, beam.end)
        return (
          <mesh
            key={beam.key}
            ref={(el) => { if (el) tubeRefs.current[i] = el }}
          >
            <tubeGeometry args={[curve, 40, 0.05, 8, false]} />
            <meshBasicMaterial
              ref={(el) => { if (el) matRefs.current[i] = el }}
              color={beam.color}
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/** Build a quadratic-bezier arc (peaks above the endpoints) between two points. */
function makeArcCurve(a: THREE.Vector3, b: THREE.Vector3): THREE.CatmullRomCurve3 {
  const mid = a.clone().add(b).multiplyScalar(0.5)
  mid.y += 1.6
  return new THREE.CatmullRomCurve3([a, mid, b], false, "catmullrom", 0.5)
}