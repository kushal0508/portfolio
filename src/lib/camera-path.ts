"use client"

import * as THREE from "three"

/**
 * Choreographed cinematic camera path.
 *
 * The camera no longer simply slides along the Z-axis. It flies a smooth
 * Catmull-Rom curve through a series of "waypoints", one per scene, with
 * per-segment banking, dolly offset, elevation, lookAt offset, FOV and a
 * relative speed multiplier — producing a hand-tuned drone-like journey
 * through one continuous world.
 *
 * Each waypoint also carries a `palette` (fog / accent / light tint) so the
 * lighting rig and post FX can cross-fade per scene and guide the visitor
 * using light, as the brief requires.
 */

export interface Waypoint {
  /** Section key this waypoint anchors. */
  key: string
  /** Scroll progress at which this waypoint is the active focus. */
  at: number
  /** Camera world position. */
  pos: [number, number, number]
  /** Point the camera looks at (offset from position, in world space). */
  look: [number, number, number]
  /** Banking angle (radians) — rolls the camera like a turning drone. */
  bank: number
  /** Extra dolly offset along the camera's right vector (subtle lateral push). */
  dolly: number
  /** Elevation nudge above the path (for swooping up/down into scenes). */
  elevation: number
  /** Horizontal field-of-view target at this waypoint. */
  fov: number
  /** Relative travel speed through this waypoint (1 = normal). */
  speed: number
  /** Per-scene palette used by lighting + post FX. */
  palette: {
    fog: string
    accent: string
    tint: string
    /** Bloom intensity multiplier at this scene. */
    bloom: number
  }
}

export const WAYPOINTS: Waypoint[] = [
  {
    key: "OPENING",
    at: 0.0,
    pos: [0, 1.6, 11],
    look: [0, 1.4, -4],
    bank: 0,
    dolly: 0,
    elevation: 0,
    fov: 58,
    speed: 0.7,
    palette: { fog: "#08080f", accent: "#6c5ce7", tint: "#a29bfe", bloom: 0.5 },
  },
  {
    key: "ABOUT",
    at: 0.16,
    pos: [2.4, 2.0, -8],
    look: [1.2, 1.6, -16],
    bank: 0.06,
    dolly: 0.2,
    elevation: 0.4,
    fov: 56,
    speed: 1.0,
    palette: { fog: "#0a0a1e", accent: "#a29bfe", tint: "#6c5ce7", bloom: 0.55 },
  },
  {
    key: "SKILLS",
    at: 0.31,
    pos: [-2.6, 1.4, -28],
    look: [-1.0, 1.6, -36],
    bank: -0.08,
    dolly: -0.25,
    elevation: -0.2,
    fov: 60,
    speed: 1.05,
    palette: { fog: "#070a1c", accent: "#00cec9", tint: "#3b82f6", bloom: 0.6 },
  },
  {
    key: "EXPERIENCE",
    at: 0.46,
    pos: [2.2, 2.6, -50],
    look: [0.6, 1.8, -60],
    bank: 0.1,
    dolly: 0.3,
    elevation: 0.8,
    fov: 55,
    speed: 1.1,
    palette: { fog: "#0a0814", accent: "#6c5ce7", tint: "#fd79a8", bloom: 0.55 },
  },
  {
    key: "PROJECTS",
    at: 0.6,
    pos: [-1.8, 1.8, -72],
    look: [-0.4, 2.0, -82],
    bank: -0.09,
    dolly: -0.2,
    elevation: 0.2,
    fov: 58,
    speed: 0.95,
    palette: { fog: "#0c0a14", accent: "#f59e0b", tint: "#fbbf24", bloom: 0.7 },
  },
  {
    key: "ACHIEVEMENTS",
    at: 0.76,
    pos: [1.6, 3.0, -94],
    look: [0, 2.0, -102],
    bank: 0.07,
    dolly: 0.15,
    elevation: 1.2,
    fov: 54,
    speed: 0.85,
    palette: { fog: "#100a08", accent: "#fbbf24", tint: "#fde68a", bloom: 0.85 },
  },
  {
    key: "CONTACT",
    at: 0.9,
    pos: [0, 1.4, -116],
    look: [0, 1.6, -124],
    bank: 0,
    dolly: 0,
    elevation: -0.2,
    fov: 52,
    speed: 0.65,
    palette: { fog: "#0a0c10", accent: "#00ff88", tint: "#00cec9", bloom: 0.5 },
  },
  {
    // Final resting position — the visitor lands at the terminal.
    key: "ENDING",
    at: 1.0,
    pos: [0, 1.4, -118],
    look: [0, 1.4, -126],
    bank: 0,
    dolly: 0,
    elevation: 0,
    fov: 50,
    speed: 0.5,
    palette: { fog: "#0a0c10", accent: "#00ff88", tint: "#00cec9", bloom: 0.45 },
  },
]

// Reusable scratch objects to avoid per-frame allocations.
const _v3 = new THREE.Vector3()
const _look = new THREE.Vector3()
const _right = new THREE.Vector3()
const _up = new THREE.Vector3(0, 1, 0)
const _quat = new THREE.Quaternion()
const _euler = new THREE.Euler()

// Pre-compute Catmull-Rom curves for position and lookAt. Using centripetal
// (chr = true) avoids cusps and overshoot for a calmer drone feel.
const _posCtrl: THREE.Vector3[] = WAYPOINTS.map((w) => new THREE.Vector3(...w.pos))
const _lookCtrl: THREE.Vector3[] = WAYPOINTS.map((w) => new THREE.Vector3(...w.look))
const _posCurve = new THREE.CatmullRomCurve3(_posCtrl, false, "catmullrom", 0.5)
const _lookCurve = new THREE.CatmullRomCurve3(_lookCtrl, false, "catmullrom", 0.5)

// Map waypoint `at` values onto curve-space so waypoints align with scroll.
// Curve getPoint expects t in [0,1] across the whole curve. We remap scroll
// progress to curve t via the piecewise-linear waypoint distribution.
const _atValues = WAYPOINTS.map((w) => w.at)
const _segCount = WAYPOINTS.length - 1

function scrollToCurveT(progress: number): number {
  const p = THREE.MathUtils.clamp(progress, 0, 1)
  for (let i = 0; i < _segCount; i++) {
    const a0 = _atValues[i]
    const a1 = _atValues[i + 1]
    if (p <= a1 || i === _segCount - 1) {
      const localT = (p - a0) / Math.max(1e-6, a1 - a0)
      return (i + localT) / _segCount
    }
  }
  return 1
}

function curveTToSegmentIndex(t: number): { index: number; localT: number } {
  const scaled = t * _segCount
  const index = Math.min(_segCount - 1, Math.floor(scaled))
  const localT = scaled - index
  return { index, localT }
}

export interface CameraSample {
  position: THREE.Vector3
  lookAt: THREE.Vector3
  /** Camera roll in radians. */
  bank: number
  /** Per-frame forward delta length — drives FOV "speed" sensation. */
  speed: number
  fov: number
}

const _samplePosA = new THREE.Vector3()
const _samplePosB = new THREE.Vector3()
const _sampleLookA = new THREE.Vector3()
const _sampleLookB = new THREE.Vector3()

/**
 * Sample the choreographed path. Mutates/returns the provided `out` sample.
 * Uses a tiny finite-difference for `speed` (distance between adjacent
 * samples) so the FOV can "breathe" with the camera's motion intensity.
 */
export function sampleCameraPath(progress: number, out: CameraSample): CameraSample {
  const t = scrollToCurveT(progress)
  const eps = 0.0015
  const tA = Math.max(0, t - eps)
  const tB = Math.min(1, t + eps)

  _posCurve.getPoint(tA, _samplePosA)
  _posCurve.getPoint(tB, _samplePosB)
  _lookCurve.getPoint(tA, _sampleLookA)
  _lookCurve.getPoint(tB, _sampleLookB)

  const segIdx = curveTToSegmentIndex(t)

  // Bank interpolates between the inbound and outbound waypoint bank values so
  // the roll feels continuous instead of stepwise.
  const wA = WAYPOINTS[segIdx.index]
  const wB = WAYPOINTS[Math.min(WAYPOINTS.length - 1, segIdx.index + 1)]
  const bank = THREE.MathUtils.lerp(wA.bank, wB.bank, segIdx.localT)
  const fov = THREE.MathUtils.lerp(wA.fov, wB.fov, segIdx.localT)
  const speedBase = THREE.MathUtils.lerp(wA.speed, wB.speed, segIdx.localT)

  // Finite-difference speed (world units per t) scaled by the relative speed.
  const dist = _samplePosB.distanceTo(_samplePosA) / (2 * eps)
  const speed = dist * speedBase

  out.position.lerpVectors(_samplePosA, _samplePosB, 0.5)
  out.lookAt.lerpVectors(_sampleLookA, _sampleLookB, 0.5)
  out.bank = bank
  out.fov = fov
  out.speed = speed
  return out
}

/**
 * Returns the right-vector (camera local X) for a given sample, used to apply
 * the per-waypoint "dolly" lateral nudge. Computed cheaply from the forward.
 */
export function applyDollyAndElevation(
  sample: CameraSample,
  waypointIndexHint: number,
  progress: number,
): void {
  // Find the current waypoint blend.
  const t = scrollToCurveT(progress)
  const { index, localT } = curveTToSegmentIndex(t)
  const wA = WAYPOINTS[index]
  const wB = WAYPOINTS[Math.min(WAYPOINTS.length - 1, index + 1)]
  const dolly = THREE.MathUtils.lerp(wA.dolly, wB.dolly, localT)
  const elevation = THREE.MathUtils.lerp(wA.elevation, wB.elevation, localT)

  if (dolly === 0 && elevation === 0) return

  _look.subVectors(sample.lookAt, sample.position).normalize()
  _right.crossVectors(_look, _up).normalize()
  _v3.copy(_right).multiplyScalar(dolly)
  sample.position.add(_v3)
  sample.position.y += elevation
  sample.lookAt.y += elevation

  // Touch the hint so callers can rely on it being computed.
  void waypointIndexHint
}

/** Smoothstep — used to ease scene palette cross-fades. */
export function smoothstep(t: number): number {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

/**
 * Returns blended palette for a given scroll progress. Mutates the provided
 * fog/accent/tint THREE.Color objects so we avoid allocations on the hot path.
 */
export function samplePalette(
  progress: number,
  fog: THREE.Color,
  accent: THREE.Color,
  tint: THREE.Color,
  bloomRef: { value: number },
): void {
  const t = scrollToCurveT(progress)
  const { index, localT } = curveTToSegmentIndex(t)
  const wA = WAYPOINTS[index]
  const wB = WAYPOINTS[Math.min(WAYPOINTS.length - 1, index + 1)]
  const e = smoothstep(localT)
  fog.set(wA.palette.fog).lerp(new THREE.Color(wB.palette.fog), e)
  accent.set(wA.palette.accent).lerp(new THREE.Color(wB.palette.tint), e * 0.5)
  tint.set(wA.palette.tint).lerp(new THREE.Color(wB.palette.accent), e * 0.5)
  bloomRef.value = THREE.MathUtils.lerp(wA.palette.bloom, wB.palette.bloom, e)
}

export function getWaypointIndexForProgress(progress: number): number {
  return curveTToSegmentIndex(scrollToCurveT(progress)).index
}

export const PALETTE_FOG_START = new THREE.Color(WAYPOINTS[0].palette.fog)
export const PALETTE_FOG_END = new THREE.Color(WAYPOINTS[WAYPOINTS.length - 1].palette.fog)

// Re-export the quaternion/euler helpers so camera controller can roll cheaply.
export function applyBankToQuaternion(quat: THREE.Quaternion, bank: number, forward: THREE.Vector3): void {
  _euler.set(0, 0, bank, "YZX")
  _quat.setFromEuler(_euler)
  // Align camera to look along `forward`, then roll by bank.
  const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), forward.clone().negate(), _up)
  const lookQuat = new THREE.Quaternion().setFromRotationMatrix(m)
  quat.copy(lookQuat).multiply(_quat)
}