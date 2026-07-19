import { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kushal R Portfolio",
    short_name: "Kushal R",
    description: "Personal portfolio of Kushal R — Odoo Techno-Functional Intern & Frontend Developer",
    start_url: "/portfolio/",
    display: "standalone",
    background_color: "#08080f",
    theme_color: "#08080f",
    icons: [
      {
        src: "/portfolio/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
