"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useScrollState } from "@/lib/scroll-provider"
import { isMobileDevice } from "@/lib/device-detect"
import type { DeviceTier } from "@/lib/device-detect"
import * as THREE from "three"

interface CameraControllerProps {
  reducedMotion?: boolean
  deviceTier?: DeviceTier
}

// Reusable scratch objects to keep the per-frame loop allocation-free.
const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _targetPos = new THREE.Vector3()
const _targetLook = new THREE.Vector3()
const _fwd = new THREE.Vector3()
const _up = new THREE.Vector3(0, 1, 0)
const _m = new THREE.Matrix4()
const _lookQuat = new THREE.Quaternion()
const _rollQuat = new THREE.Quaternion()
const _euler = new THREE.Euler()
const _ZERO = new THREE.Vector3(0, 0, 0)

/**
 * Drone-style camera controller with spline interpolation.
 */
export function CameraController({ reducedMotion = false, deviceTier = "high" }: CameraControllerProps) {
  const {
    camX,
    camY,
    camZ,
    lookX,
    lookY,
    lookZ,
    bank,
    camFov,
    smoothMouseX,
    smoothMouseY,
    velocity,
  } = useScrollState()

  const isMobile = typeof window !== "undefined" ? isMobileDevice() : false
  const isLow = deviceTier === "low"

  const lookAt = useRef(new THREE.Vector3(0, 1.4, -4))
  const idle = useRef(0)
  const camPosSmooth = useRef(new THREE.Vector3(camX, camY, camZ))
  const bankSmooth = useRef(0)
  const prevProgress = useRef(0)

  useFrame((state, delta) => {
    if (reducedMotion) {
      state.camera.position.set(camX, camY, camZ)
      state.camera.lookAt(lookX, lookY, lookZ)
      return
    }

    const dt = Math.min(delta, 0.05)

    // Adaptive damping values
    const damp = isMobile || isLow ? 0.25 : 0.15
    const velocityFactor = Math.min(Math.abs(velocity) * 0.05, 0.3)
    const smoothFactor = 1 - Math.pow(0.001, dt * (isMobile ? 0.6 : 0.8 - velocityFactor))
    const lookDamp = 1 - Math.pow(isMobile ? 0.04 : 0.015, dt)
    const bankDamp = 1 - Math.pow(isMobile ? 0.08 : 0.04, dt)

    idle.current += dt * 0.3

    // --- Mouse parallax -------------------------------------------------
    const parX = isMobile ? 0 : smoothMouseX * 1.8
    const parY = isMobile ? 0 : -smoothMouseY * 1.1
    const yaw = isMobile ? 0 : smoothMouseX * 0.05
    const pitch = isMobile ? 0 : -smoothMouseY * 0.035

    // --- Idle breathing -------------------------------------------------
    const breathing = Math.sin(idle.current * 0.45) * 0.1
    const floatY = Math.sin(idle.current * 0.3) * 0.05
    const swayX = Math.sin(idle.current * 0.22) * 0.04

    // --- Speed look-ahead ----------------------------------------------
    const lookAhead = Math.min(Math.abs(velocity) * (isMobile ? 0.5 : 1.0), 1.2) * Math.sign(velocity || 1)

    // --- Target transforms ---------------------------------------------
    _targetPos.set(
      camX + parX + swayX,
      camY + parY + breathing + floatY,
      camZ,
    )

    _targetLook.set(
      lookX + yaw + lookAhead * 0.2,
      lookY + pitch + breathing * 0.3,
      lookZ + lookAhead,
    )

    // Ease the camera position & lookAt toward their targets.
    camPosSmooth.current.lerp(_targetPos, damp)
    lookAt.current.lerp(_targetLook, lookDamp)

    _pos.copy(camPosSmooth.current)
    _look.copy(lookAt.current)

    state.camera.position.copy(_pos)

    // --- Banking -------------------------------------------------------
    const targetRoll = isMobile ? -bank * 0.2 : -bank * 0.45 + smoothMouseX * 0.015
    bankSmooth.current = THREE.MathUtils.lerp(bankSmooth.current, targetRoll, 1 - Math.pow(isMobile ? 0.08 : 0.04, dt))

    _fwd.subVectors(_look, _pos)
    const fwdLen = _fwd.length()
    if (fwdLen > 1e-5) {
      _fwd.multiplyScalar(1 / fwdLen)

      _m.lookAt(_ZERO, _fwd.clone().multiplyScalar(-1), _up)
      _lookQuat.setFromRotationMatrix(_m)
      _euler.set(0, 0, bankSmooth.current, "ZYX")
      _rollQuat.setFromEuler(_euler)
      state.camera.quaternion.copy(_lookQuat).multiply(_rollQuat)
    } else {
      state.camera.lookAt(_look)
    }

    // --- FOV breathing -------------------------------------------------
    const cam = state.camera as THREE.PerspectiveCamera
    if (cam.isPerspectiveCamera && !isMobile) {
      const speedFactor = Math.min(Math.abs(velocity) * 0.15, 1)
      const fovTarget = camFov + Math.min(Math.abs(velocity) * 0.15, 1) * 5
      cam.fov += (fovTarget - cam.fov) * (1 - Math.pow(0.001, dt * (0.8 - Math.min(Math.abs(velocity) * 0.05, 0.3)))) * 0.5
      cam.updateProjectionMatrix()
    }

    void velocity
    void camFov
  })

  return null
}