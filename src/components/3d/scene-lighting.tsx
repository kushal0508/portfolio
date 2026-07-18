"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Environment, Lightformer } from "@react-three/drei"
import * as THREE from "three"
import { useScrollState } from "@/lib/scroll-provider"

// Palette constants — match the waypoints in lib/camera-path.ts so the lights
// react to the same cinematic journey.
const COLORS = {
  PRIMARY: "#6c5ce7",
  GLOW: "#a29bfe",
  ACCENT: "#fbbf24",
  CYAN: "#00cec9",
  ROSE: "#fd79a8",
  AMBER: "#f59e0b",
  GREEN: "#00ff88",
}

const _scratch = new THREE.Color()
const _target = new THREE.Vector3()

/**
 * Per-scene dynamic lighting rig.
 *
 * Instead of one constant set of lights across the whole journey, this rigs
 * several lights positioned along the camera path and cross-fades their
 * intensities based on scroll progress — so each scene gets its own distinct
 * lighting mood:
 *
 *   OPENING       — strong cinematic spotlight (primary)
 *   ABOUT         — soft volumetric glow (violet)
 *   SKILLS        — blue volumetric lighting (cyan/blue)
 *   EXPERIENCE    — rose rim lights framing a corridor
 *   PROJECTS      — amber gallery spotlights
 *   ACHIEVEMENTS  — golden spotlight highlights
 *   CONTACT       — warm ambient terminal lighting (green/cyan)
 *
 * A single "follower" point light rides the camera and gently slides toward
 * the mouse cursor to make the world feel like it reacts to the visitor.
 */
export function SceneLighting() {
  const {
    progress,
    camX,
    camY,
    camZ,
    smoothMouseX,
    smoothMouseY,
    velocity,
  } = useScrollState()

  // Refs for the lights we animate every frame.
  const ambient = useRef<THREE.AmbientLight>(null)
  const heroSpot = useRef<THREE.SpotLight>(null)
  const skillsRim = useRef<THREE.PointLight>(null)
  const expRim = useRef<THREE.PointLight>(null)
  const projSpot = useRef<THREE.PointLight>(null)
  const achSpot = useRef<THREE.PointLight>(null)
  const contactWarm = useRef<THREE.PointLight>(null)
  const follower = useRef<THREE.PointLight>(null)
  const keyDir = useRef<THREE.DirectionalLight>(null)

  // Cache palette colors for cheap lerp on the hot path.
  const cHero = useMemo(() => new THREE.Color(COLORS.PRIMARY), [])
  const cSkills = useMemo(() => new THREE.Color(COLORS.CYAN), [])
  const cExp = useMemo(() => new THREE.Color(COLORS.ROSE), [])
  const cProj = useMemo(() => new THREE.Color(COLORS.AMBER), [])
  const cAch = useMemo(() => new THREE.Color(COLORS.ACCENT), [])
  const cContact = useMemo(() => new THREE.Color(COLORS.GREEN), [])
  const cAccent = useMemo<THREE.Color>(() => new THREE.Color(COLORS.ACCENT), [])

  useFrame(() => {
    // Smooth gate weights — how "present" each scene's lighting is.
    // Using a 1 - dist/width falloff keeps cross-fades seamless.
    const w = (center: number, width: number) =>
      Math.max(0, 1 - Math.abs(progress - center) / width)

    const wHero = w(0.06, 0.1)
    const wAbout = w(0.18, 0.09)
    const wSkills = w(0.31, 0.1)
    const wExp = w(0.46, 0.1)
    const wProj = w(0.6, 0.1)
    const wAch = w(0.76, 0.1)
    const wContact = w(0.9, 0.12)

    // Ambient lifts gently through the journey — darker in calm scenes, a
    // hair brighter in busier ones — and warm-cool shifts via the accent color.
    if (ambient.current) {
      const lift = wSkills + wProj + wAch * 0.5
      ambient.current.intensity = 0.22 + lift * 0.15
      ambient.current.color.set("#3a3a6a").lerp(cAccent, lift * 0.3)
    }

    // Key directional — always present, colour-graded to the active scene.
    if (keyDir.current) {
      // Blend the dominant scene color into the key light.
      const dominant = cHero.clone()
        .lerp(cSkills, wSkills)
        .lerp(cExp, wExp)
        .lerp(cProj, wProj)
        .lerp(cAch, wAch)
        .lerp(cContact, wContact)
      keyDir.current.color.copy(dominant)
      keyDir.current.intensity = 0.5 + (wHero + wAbout) * 0.3 + (wAch + wContact) * 0.2
    }

    // Hero spotlight — strong cinematic on the opening icosahedron.
    if (heroSpot.current) {
      heroSpot.current.intensity = wHero * 8 + wAbout * 1.5
    }

    // Skills sector — cool cyan/blue rim that brightens as we enter.
    if (skillsRim.current) {
      skillsRim.current.intensity = wSkills * 3.5
      skillsRim.current.color.set(COLORS.CYAN).lerp(new THREE.Color("#3b82f6"), 0.4)
    }

    // Experience — rose rim lights framing the corridor.
    if (expRim.current) {
      expRim.current.intensity = wExp * 3.2
      expRim.current.color.set(COLORS.ROSE).lerp(cExp, 0.5)
    }

    // Projects — amber gallery glow.
    if (projSpot.current) {
      projSpot.current.intensity = wProj * 3.0
      projSpot.current.color.set(COLORS.AMBER).lerp(cProj, 0.3)
    }

    // Achievements — golden highlight.
    if (achSpot.current) {
      achSpot.current.intensity = wAch * 4.2
      achSpot.current.color.set(COLORS.ACCENT).lerp(cAch, 0.4)
    }

    // Contact — warm ambient terminal glow (green/cyan).
    if (contactWarm.current) {
      contactWarm.current.intensity = wContact * 3.0
      contactWarm.current.color.set(COLORS.GREEN).lerp(new THREE.Color(COLORS.CYAN), 0.5)
    }

    // Follower light — rides along with the camera and gently drifts toward
    // the mouse cursor, so the world reacts to where the visitor looks.
    if (follower.current) {
      // Mouse offset in world units (gentle).
      const mx = smoothMouseX * 3.0
      const my = -smoothMouseY * 1.5
      _target.set(camX + mx, camY + my - 0.5, camZ - 3)
      _scratch.set(camX, camY, camZ)
      const speedLift = Math.min(Math.abs(velocity) * 0.2, 0.6)
      follower.current.position.lerp(_target, 0.08)
      follower.current.intensity = 0.7 + speedLift + (wHero + wContact) * 0.4
      // Colour of the follower picks up the dominant scene accent.
      follower.current.color.copy(cAccent)
      void _scratch
    }
  })

  return (
    <>
      {/* Constant low ambient + a key directional that colour-grades per scene. */}
      <ambientLight ref={ambient} intensity={0.2} color="#303060" />
      <directionalLight
        ref={keyDir}
        position={[6, 12, 8]}
        intensity={0.6}
        color={COLORS.PRIMARY}
      />
      {/* Cool fill from the opposite side for rim separation. */}
      <directionalLight position={[-8, 4, -6]} intensity={0.35} color={COLORS.ACCENT} />

      {/* Strong cinematic hero spotlight at z≈8. */}
      <spotLight
        ref={heroSpot}
        position={[2.5, 7, 12]}
        target-position={[0, 1.5, 6]}
        angle={Math.PI / 5}
        penumbra={0.7}
        decay={1.5}
        distance={25}
        intensity={8}
        color={COLORS.PRIMARY}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* Skills cool rim at z≈-30. */}
      <pointLight
        ref={skillsRim}
        position={[-3, 2.4, -30]}
        intensity={0}
        color={COLORS.CYAN}
        distance={22}
        decay={2}
      />

      {/* Experience rose rim at z≈-50. */}
      <pointLight
        ref={expRim}
        position={[3.5, 3, -50]}
        intensity={0}
        color={COLORS.ROSE}
        distance={22}
        decay={2}
      />

      {/* Projects amber gallery light at z≈-72. */}
      <pointLight
        ref={projSpot}
        position={[-2.5, 4, -72]}
        intensity={0}
        color={COLORS.AMBER}
        distance={24}
        decay={2}
      />

      {/* Achievements golden spotlight at z≈-94. */}
      <pointLight
        ref={achSpot}
        position={[2, 5, -94]}
        intensity={0}
        color={COLORS.ACCENT}
        distance={22}
        decay={2}
      />

      {/* Contact warm terminal light at z≈-116. */}
      <pointLight
        ref={contactWarm}
        position={[0, 3.5, -116]}
        intensity={0}
        color={COLORS.GREEN}
        distance={20}
        decay={2}
      />

      {/* Follower — driven each frame toward the cursor-aware target. */}
      <pointLight
        ref={follower}
        position={[0, 2, 8]}
        intensity={0.7}
        color={COLORS.ACCENT}
        distance={14}
        decay={2}
      />

      {/* Environment + lightformers drive reflections on the glass / metals. */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color={COLORS.PRIMARY}
          scale={[16, 3, 1]}
          position={[0, 6, -8]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color={COLORS.GLOW}
          scale={[14, 2, 1]}
          position={[0, 1, -40]}
        />
        <Lightformer
          form="ring"
          intensity={1.4}
          color={COLORS.ACCENT}
          scale={6}
          position={[0, 5, -72]}
        />
        <Lightformer
          form="circle"
          intensity={1.2}
          color={COLORS.CYAN}
          scale={5}
          position={[3, 3, -100]}
        />
        <Lightformer
          form="circle"
          intensity={1.0}
          color={COLORS.GREEN}
          scale={4}
          position={[-2, 3, -120]}
        />
      </Environment>
    </>
  )
}