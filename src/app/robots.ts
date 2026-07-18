import { MetadataRoute } from "next"

const siteUrl = "https://kushalr.dev"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}