"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUpRight, BriefcaseBusiness, Download, ExternalLink, Mail, MapPin, Menu, X } from "lucide-react"
import { experience, navItems, personalInfo, projects, skillGroups } from "@/lib/data"

const sectionIds = navItems.map((item) => item.href.slice(1))

function GitHubIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 4.8c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.82.58A12.01 12.01 0 0 0 24 12C24 5.37 18.63 0 12 0Z" /></svg>
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45Z" /></svg>
}

export function Portfolio() {
  const [active, setActive] = useState("hero")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0.05, 0.25, 0.5] },
    )
    sectionIds.forEach((id) => document.getElementById(id) && observer.observe(document.getElementById(id)!))
    return () => observer.disconnect()
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <nav className="nav-shell" aria-label="Primary navigation">
          <a className="wordmark" href="#hero" aria-label="Kushal R — Home" onClick={closeMenu}>KR<span>.</span></a>
          <button className="menu-button" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="primary-menu" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <div id="primary-menu" className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            {navItems.map((item) => {
              const id = item.href.slice(1)
              return <a key={item.href} href={item.href} aria-current={active === id ? "page" : undefined} onClick={closeMenu}>{item.label}</a>
            })}
            <a className="nav-resume" href={personalInfo.resume} target="_blank" rel="noreferrer" onClick={closeMenu}>Resume <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section id="hero" className="hero section">
          <div className="hero-copy">
            <p className="eyebrow">Odoo ERP · Frontend Development</p>
            <h1>Practical digital work, built for the business behind it.</h1>
            <p className="hero-lede">Building business-driven ERP solutions, responsive web applications, and modern digital experiences using Odoo ERP and modern frontend technologies.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">View selected work <ArrowDown aria-hidden="true" /></a>
              <a className="text-link" href={personalInfo.resume} target="_blank" rel="noreferrer">Download resume <Download aria-hidden="true" /></a>
            </div>
          </div>
          <aside className="hero-card" aria-label="Professional summary">
            <span className="card-index">01 / PROFILE</span>
            <p>Final-year BCA student</p>
            <p>Odoo techno-functional intern</p>
            <p>Frontend & freelance web developer</p>
            <div className="availability"><span aria-hidden="true" /> Based in Mysuru, India</div>
          </aside>
        </section>

        <section id="about" className="section about-section">
          <div><p className="eyebrow">About</p><h2>A developer who connects requirements to usable experiences.</h2></div>
          <div className="about-copy">
            <p>I’m Kushal R, a final-year BCA student at Amrita Vishwa Vidyapeetham, Mysuru. I work across Odoo ERP customization and frontend development to help businesses turn their needs into clear, practical digital products.</p>
            <ul className="role-list" aria-label="Professional focus areas">
              <li>Final-year BCA student</li><li>Odoo techno-functional intern</li><li>Frontend developer</li><li>ERP enthusiast</li><li>Freelance web developer</li>
            </ul>
          </div>
        </section>

        <section id="skills" className="section">
          <div className="section-intro"><p className="eyebrow">Capabilities</p><h2>A focused toolkit for ERP and web delivery.</h2><p>Core skills are organized by the work they support—not inflated proficiency scores.</p></div>
          <div className="skill-grid">
            {skillGroups.map((group, index) => <article className="skill-group" key={group.label}><span>0{index + 1}</span><h3>{group.label}</h3><ul>{group.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></article>)}
          </div>
        </section>

        <section id="experience" className="section experience-section">
          <div className="section-intro"><p className="eyebrow">Experience</p><h2>Hands-on ERP implementation experience.</h2></div>
          <article className="experience-card">
            <div className="experience-meta"><BriefcaseBusiness aria-hidden="true" /><p>{experience.period}</p></div>
            <div><h3>{experience.role}</h3><p className="company">{experience.company}</p><p className="experience-summary">{experience.summary}</p><ul className="achievement-list">{experience.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul><div className="tags">{experience.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></div>
          </article>
        </section>

        <section id="projects" className="section projects-section">
          <div className="section-intro"><p className="eyebrow">Selected work</p><h2>Projects shaped around real operational needs.</h2><p>Links are shown only where a public demo is available.</p></div>
          <div className="project-grid">
            {projects.map((project, index) => <article className="project-card" key={project.title}>
              <div className="project-heading"><span>0{index + 1}</span><p>{project.status}</p></div>
              <h3>{project.title}</h3><p>{project.description}</p>
              <div><h4>Key features</h4><ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div>
              <div className="tags">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
              {project.live && <a className="project-link" href={project.live} target="_blank" rel="noreferrer">View live site <ExternalLink aria-hidden="true" /></a>}
            </article>)}
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div><p className="eyebrow">Contact</p><h2>Let’s discuss what your business needs next.</h2><p>I’m open to frontend, ERP, and freelance web-development opportunities.</p></div>
          <div className="contact-actions">
            <a className="contact-primary" href={`mailto:${personalInfo.email}`}><Mail aria-hidden="true" /><span><small>Email</small>{personalInfo.email}</span><ArrowUpRight aria-hidden="true" /></a>
            <div className="contact-row"><a href={personalInfo.github} target="_blank" rel="noreferrer"><GitHubIcon /> GitHub <ExternalLink aria-hidden="true" /></a><a href={personalInfo.linkedin} target="_blank" rel="noreferrer"><LinkedInIcon /> LinkedIn <ExternalLink aria-hidden="true" /></a></div>
            <a className="contact-resume" href={personalInfo.resume} target="_blank" rel="noreferrer"><Download aria-hidden="true" /> Download resume</a>
            <p className="location"><MapPin aria-hidden="true" /> {personalInfo.location}</p>
          </div>
        </section>
      </main>
      <footer><p>© {new Date().getFullYear()} Kushal R</p><a href="#hero">Back to top ↑</a></footer>
    </>
  )
}
