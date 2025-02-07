/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporary for learning
  },
  experimental: {
    instrumentationHook: true, // For better monitoring
  }
}

module.exports = nextConfig
