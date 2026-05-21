import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@agentforge/ui', '@agentforge/db'],
}

export default nextConfig
