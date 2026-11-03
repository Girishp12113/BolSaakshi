import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Prevent Windows OneDrive concurrent worker file lock race conditions
  experimental: {
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
    workerThreads: false,
  },
}

export default nextConfig
