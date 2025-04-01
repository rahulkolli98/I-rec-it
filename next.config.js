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
  images: {
    domains: [
      'images-na.ssl-images-amazon.com',
      'books.google.com',
      'covers.openlibrary.org',
      'i.gr-assets.com',
      'm.media-amazon.com',
      'images-1.goodreads.com',
      'images-2.goodreads.com',
      'images.gr-assets.com',
      'image.tmdb.org'
    ],
  },
}

module.exports = nextConfig
