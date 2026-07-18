export interface NavItem {
  label: string
  href: string
}

export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  link?: string
  github?: string
  category?: string
  gradient?: string
}