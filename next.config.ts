import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WebP primero. Antes iba AVIF delante: comprime algo mejor, pero codificar
    // AVIF cuesta ~10x más CPU que WebP y en dev la optimización ocurre bajo
    // demanda, así que cada variante nueva tardaba segundos en aparecer. Ahora
    // que las fuentes de public/img ya están acotadas a 2000-2560px, la ganancia
    // extra de AVIF son unos pocos KB y no compensa ni el tiempo de build ni la
    // latencia del primer render de cada tamaño.
    formats: ["image/webp"],

    // 95 ya no está en la lista: reencodear a casi sin pérdida sobre fuentes que
    // ya son WebP q80-82 sólo añade peso. 90 se conserva para el zoom del
    // lightbox y 60 para los fondos muy atenuados del panel de compra.
    qualities: [60, 70, 75, 80, 85, 90],

    // Por defecto Next genera hasta 3840px. Ninguna fuente supera ya los 2560px,
    // así que pedir más sólo produce reescalados hacia arriba y ocupa caché.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Las fotos del catálogo son inmutables (si cambia la imagen cambia el
    // nombre del archivo), así que se pueden cachear un año.
    minimumCacheTTL: 31536000,

    // Las fotos del catálogo llegan como URLs absolutas desde el backend, y el
    // host depende de cómo esté configurado el almacenamiento en ese entorno:
    // CDN_URL si existe, el endpoint directo de MinIO si no, y /uploads del
    // propio API como último fallback (backend/src/lib/minio.ts:135-186).
    // Los tres tienen que estar acá o next/image aborta el render de la card.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.trecepy.com",
      },
      {
        // Productos cargados antes del rename de la marca.
        protocol: "https",
        hostname: "cdn.trece13.com",
      },
      {
        protocol: "https",
        hostname: "api.santclothes.com.py",
      },
      {
        // MinIO en desarrollo (docker-compose expone el bucket en 5012).
        protocol: "http",
        hostname: "localhost",
        port: "5012",
      },
      {
        // Fallback a disco del backend: /uploads/catalog/*.
        protocol: "http",
        hostname: "localhost",
        port: "5014",
      },
      {
        // Solo para los mocks de desarrollo. Sale junto con src/mocks/.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  experimental: {
    // lucide-react exporta ~1500 iconos desde un único barrel. Sin esto, cada
    // `import { ArrowRight } from 'lucide-react'` arrastra el módulo entero al
    // grafo del compilador y dispara el tiempo de compilación en dev.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Caché inmutable para los assets servidos desde /public, que Next no versiona
  // por sí solo (a diferencia de /_next/static). Sin esto el navegador
  // revalidaba cada foto en cada navegación.
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
    ];
  },
};

export default nextConfig;
