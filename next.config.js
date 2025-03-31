/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY,
    MONGODB_URI: process.env.MONGODB_URI,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  },
  compiler: {
    styledComponents: true,
  },
  eslint: {
    // Disable ESLint during production builds for faster deployment
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
