import { MetadataRoute } from "next"

export const dynamic = "force-static"

const siteUrl = "https://kushal0508.github.io/portfolio"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
