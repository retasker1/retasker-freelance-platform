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
}

module.exports = nextConfig
