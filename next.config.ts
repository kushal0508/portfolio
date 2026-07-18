import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/portfolio",
  trailingSlash: true,
  images: {
    unoptimized: true,
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
}

export default nextConfig
