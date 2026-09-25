import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: "standalone",

  images: {
    formats: ["image/webp"],
    qualities: [60, 70, 75, 80, 82, 85, 88, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.trecepy.com",
      },
      {
        protocol: "https",
        hostname: "cdn.trece13.com",
      },
      {
        protocol: "https",
        hostname: "api.santclothes.com.py",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5012",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5014",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "sonner"],
  },

  async headers() {
    return [
      {
        source: "/img/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
