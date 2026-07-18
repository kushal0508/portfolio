import { MetadataRoute } from "next"

export const dynamic = "force-static"

const basePath = "/portfolio"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kushal R Portfolio",
    short_name: "Kushal R",
    description: "Personal portfolio of Kushal R, an Odoo Techno-Functional Intern, Frontend Developer, Web Designer, and Freelance Web Developer based in Mysore, India.",
    start_url: `${basePath}/`,
    display: "standalone",
    background_color: "#08080f",
    theme_color: "#6c5ce7",
    icons: [
      {
        src: `${basePath}/favicon-16x16.png`,
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: `${basePath}/favicon-32x32.png`,
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: `${basePath}/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${basePath}/android-chrome-192x192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${basePath}/android-chrome-512x512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}