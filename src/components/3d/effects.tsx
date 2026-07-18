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
import type { DeviceTier } from "@/lib/device-detect"
import * as THREE from "three"

interface PostEffectsProps {
  reducedMotion?: boolean
  deviceTier?: DeviceTier
}

export function PostEffects({ reducedMotion = false, deviceTier = "high" }: PostEffectsProps) {
  const { progress, bloom, velocity } = useScrollState()

  if (reducedMotion) return null
  if (deviceTier === "low") return null

  const speedAbs = Math.min(Math.abs(velocity), 4)
  const caOffset = 0.0006 + speedAbs * 0.0006
  const msaaSamples = deviceTier === "high" ? 4 : 2

  if (deviceTier === "medium") {
    return (
      <EffectComposer multisampling={msaaSamples}>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.08}
          intensity={0.4 + bloom * 0.35}
          mipmapBlur
          radius={0.6}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.25} darkness={0.5} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={msaaSamples}>
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

export function AmbientParticles({ count = 800, reducedMotion = false }: AmbientParticlesProps) {
  const ref = useRef<THREE.Points>(null)
  const posRef = useRef<Float32Array | null>(null)

  const [geometry] = useState(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
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