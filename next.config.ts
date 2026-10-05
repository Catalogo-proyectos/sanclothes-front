import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./src/lib/security-headers";

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
        hostname: "api.santclothes.com.py",
      },
      {
        // CDN de producción (R2): ahí apuntan las URLs que guarda el backend al
        // subir imágenes desde el admin. Sin esto /_next/image responde 400.
        protocol: "https",
        hostname: "cdn.santclothes.com.py",
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
        // M4: headers de seguridad en todas las rutas (ver src/lib/security-headers.ts).
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
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
