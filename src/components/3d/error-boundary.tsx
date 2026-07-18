"use client"

import { Component, ReactNode, ErrorInfo, useState } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("3D Canvas Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#08080f",
            color: "#efeff5",
            padding: "2rem",
            zIndex: 9999,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Unable to Load 3D Experience
            </h2>
            <p style={{ color: "#7878a0", marginBottom: "1.5rem" }}>
              Your browser or device may not support WebGL, or an unexpected
              error occurred.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

interface CanvasErrorFallbackProps {
  error?: Error
  resetErrorBoundary?: () => void
}

export function CanvasErrorFallback({ error, resetErrorBoundary }: CanvasErrorFallbackProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#08080f",
        color: "#efeff5",
        padding: "2rem",
        zIndex: 9999,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          3D Experience Unavailable
        </h2>
        <p style={{ color: "#7878a0", marginBottom: "1.5rem" }}>
          {error?.message || "Unable to initialize WebGL context. Please try refreshing the page."}
        </p>
        <button
          onClick={() => resetErrorBoundary?.() || window.location.reload()}
          style={{
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

interface ThreeDCanvasWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ThreeDCanvasWrapper({ children, fallback }: ThreeDCanvasWrapperProps) {
  const [hasError, setHasError] = useState(false)

  const resetErrorBoundary = () => {
    setHasError(false)
  }

  return (
    <ErrorBoundary
      fallback={hasError ? (
        <CanvasErrorFallback resetErrorBoundary={resetErrorBoundary} />
      ) : fallback}
    >
      {children}
    </ErrorBoundary>
  )
}