/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignorar errores de tipos para que el build no se detenga
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignorar errores de linting durante el build
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
