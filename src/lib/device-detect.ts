export type DeviceTier = "low" | "medium" | "high"

let _tier: DeviceTier | null = null
let _isMobile = false
let _dpr = 1

export function getDeviceTier(): DeviceTier {
  if (_tier) return _tier
  if (typeof window === "undefined") return "high"

  _isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const canvas = document.createElement("canvas")
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info")
  const renderer = debugInfo ? gl!.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)?.toLowerCase() || "" : ""

  const isLowEndGPU = /adreno\s([56]|4\d\d|3\d\d)/.test(renderer) || /mali-/i.test(renderer) || /powervr/i.test(renderer)

  const isLowEndDevice = _isMobile && (navigator.hardwareConcurrency <= 4 || isLowEndGPU)
  const isMidDevice = _isMobile || navigator.hardwareConcurrency <= 6

  // Cap DPR at 1.0 on ALL mobile devices to prevent white flickering
  _dpr = _isMobile ? 1 : isLowEndDevice ? 1 : isMidDevice ? 1.2 : 2
  _tier = isLowEndDevice ? "low" : isMidDevice ? "medium" : "high"
  return _tier
}

export function isMobileDevice(): boolean {
  getDeviceTier()
  return _isMobile
}

export function getAdaptiveDPR(): number {
  getDeviceTier()
  return _dpr
}