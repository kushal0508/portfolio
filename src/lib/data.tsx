import type { Project, NavItem } from "@/types"

export interface Skill {
  name: string
  level: number
  category: string
  icon: string
}

export interface SkillCategory {
  label: string
  icon: string
  items: Skill[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
}

export interface ExperienceItem {
  id: string
  role: string
  company: string
  period: string
  location?: string
  description: string
  achievements: string[]
  tags: string[]
}

export const personalInfo = {
  name: "Kushal R",
  shortName: "Kushal",
  initials: "KR",
  roles: [
    "Odoo Techno-Functional Intern",
    "Frontend Developer",
    "Web Designer",
    "ERP Enthusiast",
    "Freelance Web Developer",
  ],
  location: "Mysore, Karnataka, India",
  email: "kushalshetty0508@gmail.com",
  phone: "+91 77952 67355",
  github: "https://github.com/kushal0508",
  linkedin: "https://www.linkedin.com/in/kushal-r-0256a631b/",
  resume: "https://drive.google.com/file/d/18_QjcR4mCdyM8BxDsAuQBng3nGXIBrkC/view",
  about:
    "I am a final-year BCA student passionate about building business-driven digital solutions using Odoo ERP and modern frontend technologies. I focus on ERP customization, responsive web design, and practical business workflows.",
  aboutExtended:
    "I am passionate about technology, problem-solving, and continuously improving my skills while preparing for MCA.",
}

export const education = [
  {
    degree: "Master of Computer Applications (MCA)",
    institution: "Amrita Vishwa Vidyapeetham, Mysuru",
    period: "Currently Pursuing",
    description:
      "Advanced studies in software engineering, system design, and modern web technologies.",
  },
  {
    degree: "Bachelor of Computer Applications (BCA)",
    institution: "Amrita Vishwa Vidyapeetham, Mysuru",
    period: "Completed",
    description:
      "Foundation in programming, data structures, database management, and web development.",
  },
]

export const navItems: NavItem[] = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#projects" },
  { label: "Contact", href: "#contact" },
]

export const projects: Project[] = [
  {
    id: "1",
    title: "WerWoods",
    description:
      "Odoo-based e-commerce and business workflow solution for a perfume brand.",
    tags: ["Odoo ERP", "HTML", "CSS", "JavaScript"],
    category: "E-commerce",
    gradient: "from-amber-500/20 to-rose-500/20",
    link: "https://werwoods.com",
    github: "",
  },
  {
    id: "2",
    title: "Nutrition & Diet Management System",
    description:
      "A system designed for diet planning, nutrition tracking, and health management workflows.",
    tags: ["Web", "Healthcare", "Booking/Management system concepts"],
    category: "ERP",
    gradient: "from-emerald-500/20 to-cyan-500/20",
    link: "",
    github: "",
  },
  {
    id: "3",
    title: "VIBHAV Bangalore Cake House",
    description:
      "A static bakery website built and hosted for a Bangalore cake business.",
    tags: ["HTML", "CSS", "Bootstrap", "Netlify"],
    category: "Web",
    gradient: "from-orange-500/20 to-pink-500/20",
    link: "https://spectacular-sprinkles-e27bcb.netlify.app",
    github: "https://github.com/kushal0508/vibhav-bakery",
  },
  {
    id: "4",
    title: "Marmabindhu",
    description:
      "A healthcare appointment booking website concept focused on booking and patient management.",
    tags: ["Healthcare", "Booking System", "Web"],
    category: "Healthcare",
    gradient: "from-blue-500/20 to-violet-500/20",
    link: "",
    github: "https://github.com/kushal0508/marmabindhu",
  },
  {
    id: "5",
    title: "ScrapTech",
    description:
      "A recycling-services platform concept designed around pickup scheduling and vendor-management workflows.",
    tags: ["Recycling", "Platform", "Web"],
    category: "Sustainability",
    gradient: "from-green-500/20 to-teal-500/20",
    link: "",
    github: "https://github.com/kushal0508/scraptech",
  },
]

export const experience: ExperienceItem[] = [
  {
    id: "1",
    role: "Odoo Techno-Functional Intern",
    company: "Amcap Business Consulting Pvt Ltd",
    period: "Apr 2025 – Jun 2025",
    location: "India",
    description:
      "Supported live Odoo ERP implementations by translating business requirements into website configuration and workflow setup.",
    achievements: [
      "Customized Odoo website experiences for live business projects.",
      "Helped with requirement gathering and workflow configuration.",
      "Assisted with Docker-based deployment activities and cross-functional handoffs.",
    ],
    tags: ["Odoo ERP", "Python", "HTML", "CSS", "JavaScript", "Docker", "Git"],
  },
]

// Aligned with the reference repo's skill categories and icons.
export const skillCategories: SkillCategory[] = [
  {
    label: "Frontend",
    icon: "Layout",
    items: [
      { name: "HTML", level: 90, category: "Frontend", icon: "FileCode" },
      { name: "CSS", level: 85, category: "Frontend", icon: "Palette" },
      { name: "JavaScript", level: 80, category: "Frontend", icon: "Code2" },
      { name: "Bootstrap", level: 80, category: "Frontend", icon: "Grid3X3" },
      { name: "React", level: 75, category: "Frontend", icon: "Code2" },
      { name: "Next.js", level: 70, category: "Frontend", icon: "Code2" },
      { name: "Tailwind CSS", level: 70, category: "Frontend", icon: "Palette" },
      { name: "Responsive Design", level: 85, category: "Frontend", icon: "Smartphone" },
    ],
  },
  {
    label: "Backend & ERP",
    icon: "Code",
    items: [
      { name: "Python basics", level: 70, category: "Backend & ERP", icon: "Code2" },
      { name: "Odoo ERP", level: 80, category: "Backend & ERP", icon: "Database" },
    ],
  },
  {
    label: "Tools & Deployment",
    icon: "Wrench",
    items: [
      { name: "Git & GitHub", level: 80, category: "Tools & Deployment", icon: "GitBranch" },
      { name: "Docker", level: 70, category: "Tools & Deployment", icon: "Container" },
      { name: "Netlify", level: 80, category: "Tools & Deployment", icon: "Cloud" },
    ],
  },
]

// Flat list kept for backwards compatibility with the existing QA audit.
export const skills: Skill[] = skillCategories.flatMap((c) => c.items)

export const achievements: Achievement[] = [
  {
    id: "1",
    title: "Odoo ERP Internship",
    description:
      "Completed internship in Odoo ERP development for live business projects at Amcap Business Consulting.",
    icon: "Trophy",
  },
  {
    id: "2",
    title: "Deployed Multiple Websites",
    description:
      "Built and deployed multiple responsive websites on Netlify, including VIBHAV and Marmabindhu.",
    icon: "Star",
  },
  {
    id: "3",
    title: "Business Workflow Experience",
    description:
      "Practical experience in requirement gathering and business workflow setup for ERP systems.",
    icon: "Target",
  },
  {
    id: "4",
    title: "Strong Technical Foundation",
    description:
      "Solid foundation in programming, data structures, and web technologies from BCA at Amrita.",
    icon: "Medal",
  },
]

export const journey = [
  {
    year: "BCA",
    title: "Started the Journey",
    description:
      "Began with Bachelor of Computer Applications at Amrita Vishwa Vidyapeetham, building foundations in programming and web development.",
  },
  {
    year: "Internship",
    title: "Odoo Techno-Functional Intern",
    description:
      "Joined Amcap Business Consulting, working on real-world ERP implementations, website customization, and Docker deployments.",
  },
  {
    year: "Now",
    title: "Building Practical Solutions",
    description:
      "Currently in final year of BCA, working on freelance web projects and preparing for MCA.",
  },
]