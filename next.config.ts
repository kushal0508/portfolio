import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "react-icons",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Generate sitemap and robots.txt
  async rewrites() {
    return []
  },
}

export default nextConfig
