export default function NotFound() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#08080f",
        color: "#efeff5",
        padding: "2rem",
        zIndex: 9999,
      }}
    >
      <h1 style={{ fontSize: "4rem", fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #6c5ce7, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        404
      </h1>
      <p style={{ color: "#7878a0", marginTop: "1rem", fontSize: "1.125rem" }}>
        Page not found
      </p>
      <a
        href="/"
        style={{
          marginTop: "2rem",
          padding: "0.75rem 1.5rem",
          background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          fontWeight: 600,
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        Go Home
      </a>
    </div>
  )
}
