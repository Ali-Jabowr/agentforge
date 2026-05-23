import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@agentforge/ui', '@agentforge/db'],
  // Trace files from monorepo root so Prisma engine binary is included in the bundle
  outputFileTracingRoot: path.join(__dirname, '../../'),
}

export default nextConfig
