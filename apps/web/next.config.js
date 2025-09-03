/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@retasker/shared'],
  experimental: {
    serverComponentsExternalPackages: ['styled-jsx'],
  },
  // Отключаем статическую генерацию полностью
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Отключаем API routes для статического экспорта
  distDir: 'dist',
}

module.exports = nextConfig
