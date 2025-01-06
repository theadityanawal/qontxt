/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true
    },
    eslint: {
      ignoreDuringBuilds: true
    },
    // Add this to ensure env validation runs
    env: require('./src/env.js').env
  }

  module.exports = nextConfig
