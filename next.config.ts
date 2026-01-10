import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Otimizações
  reactStrictMode: true,

  // Permitir imagens do Sleeper CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sleepercdn.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
