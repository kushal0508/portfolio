import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/portfolio",
  assetPrefix: "/portfolio/",
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
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
}

export default nextConfig
