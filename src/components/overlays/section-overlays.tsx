"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useScrollState, getCurrentSectionKey, snapToSection, type SectionKey } from "@/lib/scroll-provider"
import { personalInfo, projects, experience, skillCategories, achievements } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "motion/react"

function MagneticButton({ children, className, href, onClick, variant = "default", ...props }: {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
  variant?: "default" | "outline" | "ghost"
} & Record<string, unknown>) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [glowActive, setGlowActive] = useState(false)

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = e.clientX - rect.left - rect.width / 2
    const cy = e.clientY - rect.top - rect.height / 2
    setPos({ x: cx * 0.28, y: cy * 0.28 })
    setGlowActive(true)
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${cx * 0.04}px, ${cy * 0.04}px)`
    }
    if (glowRef.current) {
      const gx = ((e.clientX - rect.left) / rect.width) * 100
      const gy = ((e.clientY - rect.top) / rect.height) * 100
      glowRef.current.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(168,158,254,0.35), transparent 55%)`
    }
  }, [])

  const onMouseLeave = useCallback(() => {
    setPos({ x: 0, y: 0 })
    setGlowActive(false)
    if (innerRef.current) innerRef.current.style.transform = "translate(0,0)"
  }, [])

  const baseStyles = {
    default: "bg-primary text-primary-foreground hover:shadow-[0_8px_32px_rgba(108,92,231,0.4)] hover:shadow-primary/30",
    outline: "border border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 hover:shadow-[0_4px_24px_rgba(108,92,231,0.15)]",
    ghost: "text-muted-foreground hover:text-primary hover:bg-primary/5",
  }

  const Tag = href ? "a" : "button"

  return (
    <Tag
      ref={ref as React.Ref<HTMLAnchorElement & HTMLButtonElement>}
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-xl font-semibold text-sm md:text-base",
        "transition-all duration-300",
        "hover:scale-[1.03] active:scale-95",
        baseStyles[variant],
        className,
      )}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      {...props}
    >
      <span
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity: glowActive ? 1 : 0,
        }}
      />
      <span ref={innerRef} className="relative z-10 inline-flex items-center gap-2 transition-transform duration-300 ease-out">
        {children}
      </span>
    </Tag>
  )
}

function Card3D({ children, className, onClick, href, ...props }: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
} & Record<string, unknown>) {
  const ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const borderGlowRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [lifted, setLifted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotate({ x: -y * 12, y: x * 12 })
    setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(168,158,254,0.2), transparent 50%)`
    }
    if (borderGlowRef.current) {
      borderGlowRef.current.style.opacity = '1'
      borderGlowRef.current.style.background = `radial-gradient(circle at ${(e.clientX - rect.left) / rect.width * 100}% ${(e.clientY - rect.top) / rect.height * 100}%, rgba(108,92,231,0.6), transparent 50%)`
    }
  }, [])

  const onMouseEnter = useCallback(() => setLifted(true), [])
  const onMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 })
    setLifted(false)
    setMousePos({ x: 0.5, y: 0.5 })
    if (borderGlowRef.current) {
      borderGlowRef.current.style.opacity = '0'
    }
  }, [])

  const Tag = href ? "a" : "div"

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLAnchorElement>}
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "group glass rounded-xl p-6 cursor-pointer interactive relative overflow-hidden",
        "transition-all duration-500",
        "hover:border-primary/50 hover:shadow-[0_15px_50px_-10px_rgba(108,92,231,0.45)]",
        className,
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(${lifted ? 16 : 0}px) translateY(${lifted ? -6 : 0}px) scale(${lifted ? 1.02 : 1})`,
        transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.4s ease",
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      {/* Animated border glow that follows cursor */}
      <div
        ref={borderGlowRef}
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(108,92,231,0.6), transparent 40%)`,
        }}
      />
      {/* Cursor-following inner glow inside the card. */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {/* Top edge highlight on hover for a premium "lit edge". */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "linear-gradient(135deg, rgba(108,92,231,0.2), transparent 40%, rgba(251,191,36,0.15) 100%)",
          mixBlendMode: "screen",
        }}
      />
      <div className="relative z-10" style={{ transform: "translateZ(0)" }}>
        {children}
      </div>
    </Tag>
  )
}

function sectionTransform(intensity: number, offset = 15): string {
  return `translateY(${(1 - intensity) * offset}px) scale(${0.97 + 0.03 * intensity})`
}

function SectionLabel({ children, intensity }: { children: React.ReactNode; intensity: number }) {
  return (
    <div
      className="inline-flex items-center gap-2 mb-6"
      style={{
        opacity: intensity,
        transform: sectionTransform(intensity, 10),
        filter: `blur(${(1 - intensity) * 2}px)`,
        transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1), filter 0.7s ease",
      }}
    >
      <span className="h-px w-8 bg-primary/40" />
      <span className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-primary/60">
        {children}
      </span>
      <span className="h-px w-8 bg-primary/40" />
    </div>
  )
}

function SectionTitle({ children, intensity }: { children: React.ReactNode; intensity: number }) {
  return (
    <h2
      className="text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[1.0] tracking-[-0.03em] mb-8"
      style={{
        opacity: intensity,
        transform: sectionTransform(intensity, 20),
        filter: `blur(${(1 - intensity) * 3}px)`,
        transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1), filter 0.7s ease",
      }}
    >
      {children}
    </h2>
  )
}

function SectionBody({ children, intensity, delay = 0 }: { children: React.ReactNode; intensity: number; delay?: number }) {
  return (
    <p
      className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl"
      style={{
        opacity: intensity,
        transform: sectionTransform(intensity, 12),
        filter: `blur(${(1 - intensity) * 1.5}px)`,
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms, filter 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </p>
  )
}

const NAV_ITEMS = [
  { label: "Home", section: "OPENING" as const, href: "#hero" },
  { label: "About", section: "ABOUT" as const, href: "#about" },
  { label: "Skills", section: "SKILLS" as const, href: "#skills" },
  { label: "Experience", section: "EXPERIENCE" as const, href: "#experience" },
  { label: "Projects", section: "PROJECTS" as const, href: "#projects" },
  { label: "Achievements", section: "ACHIEVEMENTS" as const, href: "#achievements" },
  { label: "Contact", section: "CONTACT" as const, href: "#contact" },
]

const SECTION_NUMBERS: Record<string, string> = {
  OPENING: "01", ABOUT: "02", SKILLS: "03", EXPERIENCE: "04", PROJECTS: "05", ACHIEVEMENTS: "06", CONTACT: "07",
}

export function Navigation() {
  const { progress, lenis } = useScrollState()
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const linksContainerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const reduceMotion = useReducedMotion()

  // Derive active section with hysteresis to prevent flickering between adjacent sections
  const sectionKey = getCurrentSectionKey(progress)
  const activeNavItem = NAV_ITEMS.find(item => item.section === sectionKey)?.label ?? "Home"
  const activeIndex = NAV_ITEMS.findIndex(item => item.label === activeNavItem)

  // Track scroll for navbar shrink effect using passive scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  const scrollToSection = useCallback((section: SectionKey) => {
    snapToSection(section, lenis ?? undefined)
    setMobileMenuOpen(false)
  }, [lenis])

  // Measure element position for the active indicator using getBoundingClientRect.
  // Uses direct DOM reads + ref updates to avoid React re-render churn.
  const indicatorCache = useRef({ left: 0, width: 0, opacity: 0 })
  const measureIndicator = useCallback(() => {
    const container = linksContainerRef.current
    if (!container) return

    const buttons = container.querySelectorAll('.nav-link')
    if (activeIndex < 0 || activeIndex >= buttons.length) {
      setIndicatorStyle({ left: 0, width: 0, opacity: 0 })
      return
    }

    const activeEl = buttons[activeIndex] as HTMLElement
    const containerRect = container.getBoundingClientRect()
    const elRect = activeEl.getBoundingClientRect()

    const newLeft = elRect.left - containerRect.left
    const newWidth = elRect.width

    if (indicatorCache.current.left !== newLeft || indicatorCache.current.width !== newWidth) {
      indicatorCache.current = { left: newLeft, width: newWidth, opacity: 1 }
      setIndicatorStyle(indicatorCache.current)
    }
  }, [activeIndex])

  // Update indicator when section changes or on resize
  useEffect(() => {
    if (reduceMotion) return
    measureIndicator()
    window.addEventListener('resize', measureIndicator)
    return () => window.removeEventListener('resize', measureIndicator)
  }, [activeNavItem, measureIndicator, reduceMotion])

  const handleNavClick = useCallback((e: React.MouseEvent, section: SectionKey) => {
    e.preventDefault()
    scrollToSection(section)
  }, [scrollToSection])

  const handleHomeClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    lenis?.scrollTo(0, {
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    })
    setMobileMenuOpen(false)
  }, [lenis])

  return (
    <>
      <div className="scroll-progress" style={{ zIndex: 60 }}>
        <div
          className="scroll-progress-track"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <nav
        ref={navRef}
        className={cn("nav-floating", scrolled && "scrolled")}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="nav-inner">
          <div className="flex items-center gap-6">
            <button
              onClick={handleHomeClick}
              className="nav-brand group relative text-lg font-bold tracking-tight interactive"
              aria-label="Go to Home"
            >
              <span className="nav-brand-text">{personalInfo.initials}</span>
              <span className="nav-brand-underline" aria-hidden="true" />
            </button>

            <span
              className="hidden md:inline-flex items-center text-xs font-mono tracking-widest"
              style={{ color: "rgba(108,92,231,0.4)" }}
            >
              <span style={{ color: "rgba(108,92,231,0.7)" }}>
                {SECTION_NUMBERS[activeNavItem] || "00"}
              </span>
              <span className="mx-2">/</span>
              <span>07</span>
            </span>
          </div>

          <div ref={linksContainerRef} className="nav-links hidden md:flex items-center gap-1 relative">
            {/* Active indicator pill that smoothly slides to active item */}
            <div
              ref={indicatorRef}
              className="nav-active-indicator"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />
            {NAV_ITEMS.map(({ label, section }) => {
              const isActive = activeNavItem === label
              const isHovered = hoveredNav === label
              return (
                <button
                  key={label}
                  onClick={(e) => handleNavClick(e, section)}
                  onMouseEnter={() => setHoveredNav(label)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className="nav-link relative z-10"
                  style={{
                    ["--glow-x" as string]: isHovered ? "50%" : "50%",
                    ["--glow-y" as string]: isHovered ? "50%" : "50%",
                  }}
                  aria-current={isActive ? "page" : undefined}
                  data-active={isActive}
                >
                  {label}
                  <span className="nav-link-glow" aria-hidden="true" />
                </button>
              )
            })}
          </div>

          <div className="nav-actions flex items-center gap-3">
            <div className="nav-social hidden lg:flex items-center gap-2">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="nav-social-link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="nav-social-link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
            <a href={personalInfo.resume} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex nav-btn nav-btn-outline px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full interactive">
              <span>Resume</span>
            </a>
            <button
              className="nav-mobile-toggle md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "open" : ""
        )}
        style={{ paddingTop: "5rem" }}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col items-center gap-4 px-6 py-8">
          {NAV_ITEMS.map(({ label, section }) => {
            const active = activeNavItem === label
            return (
              <button
                key={label}
                onClick={(e) => handleNavClick(e, section)}
                className={cn(
                  "mobile-nav-link w-full text-left px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 interactive",
                  active ? "active" : ""
                )}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

export function SectionOverlays() {
  const { progress } = useScrollState()

  const openingIntensity = Math.max(0, 1 - progress / 0.1)
  const aboutIntensity = Math.max(0, 1 - Math.abs(progress - 0.1875) / 0.0625)
  const skillsIntensity = Math.max(0, 1 - Math.abs(progress - 0.3125) / 0.0625)
  const expIntensity = Math.max(0, 1 - Math.abs(progress - 0.4375) / 0.0625)
  const projectsIntensity = Math.max(0, 1 - Math.abs(progress - 0.5625) / 0.0625)
  const achIntensity = Math.max(0, 1 - Math.abs(progress - 0.6875) / 0.0625)
  const contactIntensity = Math.max(0, 1 - Math.abs(progress - 0.875) / 0.125)

  const heroContainerStyle = {
    opacity: openingIntensity,
    transform: `translateY(${(1 - openingIntensity) * 30}px) scale(${0.92 + 0.08 * openingIntensity})`,
    filter: `blur(${(1 - openingIntensity) * 3}px)`,
    transition: "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.8s ease, filter 0.8s ease",
  }

  const heroTitleLineStyle = (i: number) => ({
    opacity: openingIntensity,
    transform: `translateY(${(1 - openingIntensity) * (20 + i * 8)}px)`,
    transition: `transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) ${i * 0.08}s, opacity 0.7s ease ${i * 0.08}s`,
  })

  const heroDescriptionStyle = {
    opacity: openingIntensity,
    transform: `translateY(${(1 - openingIntensity) * 15}px)`,
    filter: `blur(${(1 - openingIntensity) * 2}px)`,
    transition: "transform 0.7s ease 0.2s, opacity 0.7s ease 0.2s, filter 0.7s ease 0.2s",
  }

  const heroCtaStyle = {
    opacity: openingIntensity,
    transform: `translateY(${(1 - openingIntensity) * 10}px)`,
    filter: `blur(${(1 - openingIntensity) * 1.5}px)`,
    transition: "transform 0.7s ease 0.35s, opacity 0.7s ease 0.35s, filter 0.7s ease 0.35s",
  }

  return (
    <div className="fixed inset-0 z-20 pointer-events-none" style={{ paddingTop: "calc(var(--nav-height) + 2rem)" }}>
      {/* Opening/Hero */}
      <div
        id="hero"
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: openingIntensity > 0.5 ? "auto" : "none", scrollMarginTop: "calc(var(--nav-height) + 24px)" }}
      >
        <div
          className="text-center px-6 max-w-5xl"
          style={heroContainerStyle}
        >
          <div
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full mb-10"
            style={{
              background: "rgba(108,92,231,0.08)",
              border: "1px solid rgba(108,92,231,0.2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(108,92,231,0.6)] animate-pulse" />
            <span className="text-sm md:text-base text-primary font-medium tracking-wide">
              {personalInfo.roles[0]} · {personalInfo.roles[1]}
            </span>
          </div>

          <h1 className="text-[clamp(2.5rem,9vw,6.5rem)] font-extrabold leading-[0.85] tracking-[-0.03em] mb-6">
            {[
              { text: personalInfo.shortName, gradient: true },
              { text: "Frontend Developer", gradient: false },
            ].map((line, i) => (
              <span
                key={i}
                className={`block ${line.gradient ? "bg-gradient-to-r from-[#6c5ce7] via-[#a29bfe] to-[#fbbf24] bg-clip-text text-transparent" : "text-foreground"}`}
                style={heroTitleLineStyle(i)}
              >
                {line.text}
              </span>
            ))}
          </h1>

          <p
            className="text-sm md:text-base text-muted-foreground/80 max-w-xl mx-auto leading-relaxed mb-10 tracking-wide"
            style={heroDescriptionStyle}
          >
            Odoo Techno-Functional Intern &mdash; building scalable ERP solutions and responsive digital experiences.
          </p>

          <div
            className="flex items-center justify-center gap-4 pointer-events-auto"
            style={heroCtaStyle}
          >
            <MagneticButton
              href={personalInfo.resume}
              className="px-8 py-3.5 rounded-xl text-sm font-semibold"
              aria-label="View Resume"
            >
              View Resume
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </MagneticButton>
            <MagneticButton
              onClick={() => window.scrollTo({ top: 7500, behavior: "smooth" })}
              variant="outline"
              className="px-8 py-3.5 rounded-xl text-sm font-semibold"
              aria-label="Get in Touch"
            >
              Get in Touch
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* About */}
      <div
        id="about"
        className="absolute inset-0 flex items-center px-6 md:px-16 lg:px-24 section-overlay"
        style={{ pointerEvents: aboutIntensity > 0.5 ? "auto" : "none", scrollMarginTop: "calc(var(--nav-height) + 2rem)" }}
      >
        <div className="max-w-3xl">
          <SectionLabel intensity={aboutIntensity}>About</SectionLabel>
          <SectionTitle intensity={aboutIntensity}>
            Building{" "}
            <span className="bg-gradient-to-r from-[#6c5ce7] to-[#fbbf24] bg-clip-text text-transparent">
              practical
            </span>{" "}
            digital solutions
          </SectionTitle>
          <SectionBody intensity={aboutIntensity} delay={0}>
            I&apos;m a final-year BCA student passionate about ERP and web development, with experience in Odoo ERP customization and frontend development using HTML, CSS, JavaScript, Bootstrap, React, and Next.js.
          </SectionBody>
          <SectionBody intensity={aboutIntensity} delay={100}>
            As a freelance web developer, I focus on business automation, user-friendly interfaces, and scalable digital solutions. I build business-driven ERP solutions and responsive web applications.
          </SectionBody>
          <div
            className="flex items-center gap-6 mt-8"
            style={{
              opacity: aboutIntensity,
              transform: `translateY(${(1 - aboutIntensity) * 10}px)`,
              filter: `blur(${(1 - aboutIntensity) * 1.5}px)`,
              transition: "opacity 0.7s ease 200ms, transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) 200ms, filter 0.7s ease 200ms",
            }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {personalInfo.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {personalInfo.email}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div
        id="skills"
        className="absolute inset-0 flex items-center justify-center px-6 md:px-16 section-overlay"
        style={{ pointerEvents: skillsIntensity > 0.5 ? "auto" : "none", scrollMarginTop: "calc(var(--nav-height) + 2rem)" }}
      >
        <div className="text-center max-w-5xl">
          <SectionLabel intensity={skillsIntensity}>Skills</SectionLabel>
          <SectionTitle intensity={skillsIntensity}>
            Technologies{" "}
            <span className="bg-gradient-to-r from-[#6c5ce7] to-[#fbbf24] bg-clip-text text-transparent">
              & tools
            </span>
          </SectionTitle>
          <div
            className="flex flex-wrap justify-center gap-4 md:gap-5 mt-12"
            style={{
              opacity: skillsIntensity,
              filter: `blur(${(1 - skillsIntensity) * 2}px)`,
              transition: "opacity 0.7s ease, filter 0.7s ease",
            }}
          >
            {skillCategories.flatMap((category, catIndex) =>
              category.items.map((skill, skillIndex) => (
                <span
                  key={`${category.label}-${skill.name}`}
                  className="relative px-5 py-2.5 text-sm md:text-base font-medium rounded-xl border transition-all duration-300 interactive"
                  style={{
                    borderColor: `rgba(108,92,231,${0.15 + (skill.level / 100) * 0.25})`,
                    background: `rgba(108,92,231,${0.03 + (skill.level / 100) * 0.08})`,
                    color: `rgba(239,239,245,${0.6 + (skill.level / 100) * 0.4})`,
                    transitionDelay: `${(catIndex * 5 + skillIndex) * 25}ms`,
                    transform: `translateY(${(1 - skillsIntensity) * 10}px)`,
                  }}
                >
                  {skill.name}
                  <span
                    className="absolute bottom-0 left-2 right-2 h-px rounded-full transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(108,92,231,${skill.level / 100 * 0.5}), transparent)`,
                      opacity: skillsIntensity,
                    }}
                  />
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Experience */}
      <div
        id="experience"
        className="absolute inset-0 flex items-center px-6 md:px-16 lg:px-24 section-overlay"
        style={{ pointerEvents: expIntensity > 0.5 ? "auto" : "none", scrollMarginTop: "calc(var(--nav-height) + 2rem)" }}
      >
        <div className="max-w-3xl w-full">
          <SectionLabel intensity={expIntensity}>Experience</SectionLabel>
          <SectionTitle intensity={expIntensity}>
            Professional{" "}
            <span className="bg-gradient-to-r from-[#6c5ce7] to-[#fbbf24] bg-clip-text text-transparent">
              journey
            </span>
          </SectionTitle>
          <div style={{
            opacity: expIntensity,
            filter: `blur(${(1 - expIntensity) * 2}px)`,
            transition: "opacity 0.7s ease, filter 0.7s ease",
          }}>
            {experience.map((exp) => (
              <Card3D key={exp.id} className="mt-8">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">{exp.role}</h3>
                </div>
                <p className="text-sm md:text-base text-primary font-medium mb-1">
                  {exp.company} · {exp.period}
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        background: "rgba(108,92,231,0.06)",
                        color: "rgba(168,158,254,0.8)",
                        border: "1px solid rgba(108,92,231,0.12)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div
        id="projects"
        className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 section-overlay"
        style={{ pointerEvents: projectsIntensity > 0.5 ? "auto" : "none", scrollMarginTop: "calc(var(--nav-height) + 2rem)" }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <div
            style={{
              opacity: projectsIntensity,
              transform: `translateY(${(1 - projectsIntensity) * 15}px)`,
              filter: `blur(${(1 - projectsIntensity) * 2}px)`,
              transition: "transform 0.7s ease, opacity 0.7s ease, filter 0.7s ease",
            }}
          >
            <SectionLabel intensity={projectsIntensity}>Work</SectionLabel>
            <SectionTitle intensity={projectsIntensity}>
              Featured{" "}
              <span className="bg-gradient-to-r from-[#6c5ce7] to-[#fbbf24] bg-clip-text text-transparent">
                projects
              </span>
            </SectionTitle>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10"
            style={{
              opacity: projectsIntensity,
              filter: `blur(${(1 - projectsIntensity) * 1.5}px)`,
              transition: "opacity 0.7s ease 0.1s, filter 0.7s ease 0.1s",
            }}
          >
            {projects.map((project) => (
              <Card3D
                key={project.id}
                style={{ cursor: project.link ? "pointer" : "default" }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: `linear-gradient(135deg, rgba(108,92,231,0.15), rgba(162,155,254,0.08))`,
                      color: "#a29bfe",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/50">
                    {project.category || "Project"}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-foreground mb-2 leading-tight">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed mb-auto">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[10px] font-medium rounded-full tracking-wide"
                      style={{
                        background: "rgba(108,92,231,0.06)",
                        color: "rgba(168,158,254,0.75)",
                        border: "1px solid rgba(108,92,231,0.1)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border/30">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg",
                        "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(108,92,231,0.2)]",
                        "transition-all duration-300 active:scale-95",
                        "border border-primary/20",
                        "interactive"
                      )}
                      aria-label={`View ${project.title} live demo`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      Live
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg",
                        "bg-muted text-foreground/80 hover:text-foreground hover:bg-muted/80",
                        "transition-all duration-300 active:scale-95",
                        "border border-border/60",
                        "interactive"
                      )}
                      aria-label={`View ${project.title} source code on GitHub`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      Code
                    </a>
                  )}
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div
        id="achievements"
        className="absolute inset-0 flex items-center justify-center px-6 md:px-16 section-overlay"
        style={{ pointerEvents: achIntensity > 0.5 ? "auto" : "none", scrollMarginTop: "calc(var(--nav-height) + 2rem)" }}
      >
        <div className="text-center max-w-4xl">
          <SectionLabel intensity={achIntensity}>Achievements</SectionLabel>
          <SectionTitle intensity={achIntensity}>
            Milestones{" "}
            <span className="bg-gradient-to-r from-[#6c5ce7] to-[#fbbf24] bg-clip-text text-transparent">
              & recognition
            </span>
          </SectionTitle>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10 text-left"
            style={{
              opacity: achIntensity,
              filter: `blur(${(1 - achIntensity) * 2}px)`,
              transition: "opacity 0.7s ease, filter 0.7s ease",
            }}
          >
            {achievements.map((ach) => (
              <Card3D key={ach.id}>
                <h3 className="text-base md:text-lg font-bold text-foreground mb-2">
                  {ach.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {ach.description}
                </p>
              </Card3D>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div
        id="contact"
        className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 section-overlay"
        style={{ pointerEvents: contactIntensity > 0.5 ? "auto" : "none", scrollMarginTop: "calc(var(--nav-height) + 2rem)" }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <div
            style={{
              opacity: contactIntensity,
              transform: `translateY(${(1 - contactIntensity) * 15}px)`,
              filter: `blur(${(1 - contactIntensity) * 2}px)`,
              transition: "transform 0.7s ease, opacity 0.7s ease, filter 0.7s ease",
            }}
          >
            <SectionLabel intensity={contactIntensity}>Contact</SectionLabel>
            <SectionTitle intensity={contactIntensity}>
              Let&apos;s{" "}
              <span className="bg-gradient-to-r from-[#6c5ce7] to-[#fbbf24] bg-clip-text text-transparent">
                connect
              </span>
            </SectionTitle>
          </div>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10"
            style={{
              opacity: contactIntensity,
              filter: `blur(${(1 - contactIntensity) * 1.5}px)`,
              transition: "opacity 0.7s ease 0.1s, filter 0.7s ease 0.1s",
            }}
          >
            <Card3D className="text-center !p-5 md:!p-6 interactive" href={`mailto:${personalInfo.email}`}>
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 mx-auto mb-2.5 rounded-xl" style={{ background: "rgba(108,92,231,0.1)", border: "1px solid rgba(108,92,231,0.2)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(108,92,231,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </div>
              <div className="text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "rgba(108,92,231,0.5)" }}>
                Email
              </div>
              <p className="text-xs md:text-sm text-foreground/90 font-medium truncate">
                {personalInfo.email}
              </p>
            </Card3D>
            <Card3D className="text-center !p-5 md:!p-6 interactive" href={`tel:${personalInfo.phone.replace(/\s/g, "")}`}>
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 mx-auto mb-2.5 rounded-xl" style={{ background: "rgba(108,92,231,0.1)", border: "1px solid rgba(108,92,231,0.2)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(108,92,231,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className="text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "rgba(108,92,231,0.5)" }}>
                Phone
              </div>
              <p className="text-xs md:text-sm text-foreground/90 font-medium">
                {personalInfo.phone}
              </p>
            </Card3D>
            <Card3D className="text-center !p-5 md:!p-6 interactive" href={`https://www.google.com/maps/place/${encodeURIComponent(personalInfo.location)}`}>
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 mx-auto mb-2.5 rounded-xl" style={{ background: "rgba(108,92,231,0.1)", border: "1px solid rgba(108,92,231,0.2)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(108,92,231,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "rgba(108,92,231,0.5)" }}>
                Location
              </div>
              <p className="text-xs md:text-sm text-foreground/90 font-medium truncate">
                {personalInfo.location}
              </p>
            </Card3D>
            <Card3D className="text-center !p-5 md:!p-6 interactive" href={personalInfo.resume}>
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 mx-auto mb-2.5 rounded-xl" style={{ background: "rgba(108,92,231,0.1)", border: "1px solid rgba(108,92,231,0.2)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(108,92,231,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" x2="12" y1="15" y2="3"></line>
                </svg>
              </div>
              <div className="text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "rgba(108,92,231,0.5)" }}>
                Resume
              </div>
              <p className="text-xs md:text-sm text-primary font-semibold">
                Download CV
              </p>
            </Card3D>
          </div>
          <div
            className="flex items-center justify-center gap-3 md:gap-4 mt-10 pointer-events-auto flex-wrap"
            style={{
              opacity: contactIntensity,
              filter: `blur(${(1 - contactIntensity) * 1}px)`,
              transition: "opacity 0.7s ease 0.2s, filter 0.7s ease 0.2s",
            }}
          >
            <MagneticButton href={personalInfo.github} variant="outline" className="px-6 py-3 rounded-xl text-sm font-semibold" aria-label="GitHub profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </MagneticButton>
            <MagneticButton href={personalInfo.linkedin} variant="outline" className="px-6 py-3 rounded-xl text-sm font-semibold" aria-label="LinkedIn profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </MagneticButton>
            <MagneticButton href={`mailto:${personalInfo.email}`} className="px-6 py-3 rounded-xl text-sm font-semibold">
              Email Me
            </MagneticButton>
          </div>

          <div
            className="flex items-center justify-center mt-16 pb-8"
            style={{
              opacity: contactIntensity * 0.5,
              filter: `blur(${(1 - contactIntensity) * 1}px)`,
              transition: "opacity 0.7s ease 0.3s, filter 0.7s ease 0.3s",
            }}
          >
            <p className="text-xs text-muted-foreground tracking-wide">
              &copy; {new Date().getFullYear()} {personalInfo.shortName} — Crafted with care
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}