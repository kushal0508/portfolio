import { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kushal R Portfolio",
    short_name: "Kushal R",
    description: "Personal portfolio of Kushal R, an Odoo Techno-Functional Intern, Frontend Developer, Web Designer, and Freelance Web Developer based in Mysore, India.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080f",
    theme_color: "#6c5ce7",
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}