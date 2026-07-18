"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  ToneMapping,
  HueSaturation,
  BrightnessContrast,
} from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import { useScrollState } from "@/lib/scroll-provider"
import * as THREE from "three"

interface PostEffectsProps {
  reducedMotion?: boolean
}

/**
 * Premium cinematic post-processing stack.
 *
 *   • Bloom — driven by scene bloom palette (per-scene intensity).
 *   • HueSaturation + BrightnessContrast — gentle color grading.
 *   • ToneMapping — ACES filmic for premium highlight roll-off.
 *   • Vignette — draws the eye toward the centre / camera lookAt.
 *   • ChromaticAberration — sub-pixel, intensifies with scroll speed.
 *
 * Intensities stay modest on purpose to protect a stable 60 FPS budget.
 *
 * Note on ambient occlusion: a real SSAO pass (e.g. N8AO / SSAO) emits
 * `glBlitFramebuffer` depth/stencil warnings and causes GPU readback stalls
 * on a wide range of drivers here, which is unacceptable for a smooth
 * premium feel. We instead fake AO via the atmospheric vignette + contact
 * shadows baked into the connected-world floor + fog falloff, which reads as
 * authentic contact depth without any GPU-side stalls.
 */
export function PostEffects({ reducedMotion = false }: PostEffectsProps) {
  const { progress, bloom, velocity } = useScrollState()

  if (reducedMotion) {
    return null
  }

  // Speed-reactive chromatic aberration — a whisper, never a smear.
  const speedAbs = Math.min(Math.abs(velocity), 4)
  const caOffset = 0.0006 + speedAbs * 0.0006

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={0.06}
        luminanceSmoothing={0.1}
        intensity={0.5 + bloom * 0.55}
        mipmapBlur
        radius={0.85}
      />
      <HueSaturation hue={0.0} saturation={0.1 + progress * 0.05} />
      <BrightnessContrast brightness={0.03} contrast={0.08} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <ChromaticAberration
        offset={new THREE.Vector2(caOffset, caOffset)}
        radialModulation={false}
        modulationOffset={0.15}
      />
      <Vignette eskil={false} offset={0.22} darkness={0.65} />
    </EffectComposer>
  )
}

interface AmbientParticlesProps {
  count?: number
  reducedMotion?: boolean
}

/**
 * Ambient drifting dust — a thin layer of particles spanning the whole
 * journey so the air never feels empty, even between scenes. Keeps the
 * same color-glow tonality as the rest of the world.
 */
export function AmbientParticles({ count = 800, reducedMotion = false }: AmbientParticlesProps) {
  const ref = useRef<THREE.Points>(null)
  const posRef = useRef<Float32Array | null>(null)

  // eslint-disable-next-line react-hooks/refs
  const [geometry] = useState(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Spread across the whole journey Z range with some lateral drift.
      positions[i3] = (Math.random() - 0.5) * 160
      positions[i3 + 1] = (Math.random() - 0.5) * 60
      positions[i3 + 2] = -10 - Math.random() * 120

      const color = new THREE.Color().setHSL(
        0.72 + Math.random() * 0.18,
        0.6,
        0.3 + Math.random() * 0.4,
      )
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    posRef.current = positions.slice() as Float32Array

    return geo
  })

  useFrame(({ clock }) => {
    if (reducedMotion) return
    if (!ref.current || !posRef.current) return
    const t = clock.getElapsedTime()
    const pos = ref.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const initY = posRef.current[i3 + 1]
      const initX = posRef.current[i3]
      pos[i3] = initX + Math.sin(t * 0.1 + i * 0.005) * 0.5
      pos[i3 + 1] = initY + Math.sin(t * 0.15 + i * 0.003) * 0.8
      pos[i3 + 2] += Math.sin(t * 0.05 + i * 0.001) * 0.005
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <primitive object={geometry} />
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}