import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // TODO: In production, we should only allow the domains we need
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '53f5l92sig.ufs.sh',
        pathname: '/**' // allow all paths on this host
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**' // allow all paths on this host
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**' // allow all paths on this host
      }
    ]
  },
  experimental: {
    authInterrupts: true
  }
}
