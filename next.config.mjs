/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  output: "export",
  distDir: "dist",
  images: { unoptimized: true },
  reactStrictMode: false,
  trailingSlash: true,
}

export default nextConfig
