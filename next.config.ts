import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // TODO: In production, we should only allow the domains we need
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '53f5l92sig.ufs.sh',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**'
      }
    ]
  },
  experimental: {
    authInterrupts: true
  }
}
