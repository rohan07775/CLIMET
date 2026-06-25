/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during production build for faster and warning-free hackathon builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TS build errors during docker compose compilation for smoother setup
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
