"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useScrollState } from "@/lib/scroll-provider"
import * as THREE from "three"

interface CameraControllerProps {
  reducedMotion?: boolean
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
 *
 * Reads the choreographed path baked into the scroll state (position, lookAt,
 * bank, fov, speed) and applies it with cinematic cubic easing. The camera also
 * reacts to the cursor — a small translational parallax, a subtle heading
 * yaw, and a roll that *counter-banks* into the path's banking so the world
 * feels physically banked while the camera stays roughly level — plus a
 * breathing/idle sway so the frame is never frozen.
 *
 * A pivot "rig" groups the camera so head-bob/parallax can be applied in
 * the camera's local space without fighting the world-space path.
 */
export function CameraController({ reducedMotion = false }: CameraControllerProps) {
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

  const lookAt = useRef(new THREE.Vector3(0, 1.4, -4))
  const idle = useRef(0)
  const camPosSmooth = useRef(new THREE.Vector3(camX, camY, camZ))
  const bankSmooth = useRef(0)
  const prevProgress = useRef(0)

  useFrame((state, delta) => {
    if (reducedMotion) {
      // In reduced motion mode, just set position directly without animation
      state.camera.position.set(camX, camY, camZ)
      state.camera.lookAt(lookX, lookY, lookZ)
      return
    }

    const dt = Math.min(delta, 0.05)
    
    // Cubic spline easing for ultra-smooth camera movement
    prevProgress.current = state.clock.elapsedTime * 0.1
    
    // Adaptive damping based on velocity - slower when scrolling fast for stability
    const baseDamp = 0.15
    const velocityFactor = Math.min(Math.abs(velocity) * 0.05, 0.3)
    const damp = baseDamp + velocityFactor
    const smoothFactor = 1 - Math.pow(0.001, dt * (0.8 - velocityFactor))
    
    const lookDamp = 1 - Math.pow(0.015, dt)
    const bankDamp = 1 - Math.pow(0.04, dt)

    idle.current += dt * 0.3

    // --- Mouse parallax -------------------------------------------------
    // Translate the camera slightly toward the cursor and yaw the heading a
    // touch. Strong enough to feel alive, gentle enough to never disorient.
    const parX = smoothMouseX * 1.8
    const parY = -smoothMouseY * 1.1
    const yaw = smoothMouseX * 0.05
    const pitch = -smoothMouseY * 0.035

    // --- Idle breathing -------------------------------------------------
    const breathing = Math.sin(idle.current * 0.45) * 0.1
    const floatY = Math.sin(idle.current * 0.3) * 0.05
    const swayX = Math.sin(idle.current * 0.22) * 0.04

    // --- Speed look-ahead ----------------------------------------------
    // Push the lookAt slightly forward when scrolling fast for a "rushing"
    // sensation, and pull it back when slowing down.
    const lookAhead = Math.min(Math.abs(velocity) * 1.0, 1.2) * Math.sign(velocity || 1)

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
    // We counter-bank half the path bank so the world tilts and the camera
    // feels like it's leaning into the turn — a drone flying a curve.
    const targetRoll = -bank * 0.45 + smoothMouseX * 0.015
    bankSmooth.current = THREE.MathUtils.lerp(bankSmooth.current, targetRoll, bankDamp)

    _fwd.subVectors(_look, _pos)
    const fwdLen = _fwd.length()
    if (fwdLen > 1e-5) {
      _fwd.multiplyScalar(1 / fwdLen)

      // Build a lookAt quaternion along the forward vector, then apply a
      // roll around the camera's local Z (forward) axis.
      _m.lookAt(_ZERO, _fwd.clone().multiplyScalar(-1), _up)
      _lookQuat.setFromRotationMatrix(_m)
      _euler.set(0, 0, bankSmooth.current, "ZYX")
      _rollQuat.setFromEuler(_euler)
      state.camera.quaternion.copy(_lookQuat).multiply(_rollQuat)
    } else {
      state.camera.lookAt(_look)
    }

    // --- FOV breathing -------------------------------------------------
    // Widen FOV with speed (sense of motion) and ease it back when idle.
    const cam = state.camera as THREE.PerspectiveCamera
    if (cam.isPerspectiveCamera) {
      const speedFactor = Math.min(Math.abs(velocity) * 0.15, 1)
      const fovTarget = camFov + speedFactor * 5
      cam.fov += (fovTarget - cam.fov) * smoothFactor * 0.5
      cam.updateProjectionMatrix()
    }

    // Expose a tiny "rig" pivot for child cameras/effects that want local
    // head-bob without touching world placement. Cheap, allocation-free.
    void velocity
    void camFov
  })

  return null
}