/** @type {import('next').NextConfig} */
const nextConfig = {
  // En Next.js 16+, algunas opciones de eslint se manejan vía CLI o archivos aparte
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Forzamos el uso de la configuración de alias del tsconfig
  transpilePackages: ["@/lib"],
}

export default nextConfig
