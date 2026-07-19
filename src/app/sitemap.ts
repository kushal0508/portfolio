import { MetadataRoute } from "next"

export const dynamic = "force-static"

const siteUrl = "https://kushal0508.github.io/portfolio"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}
