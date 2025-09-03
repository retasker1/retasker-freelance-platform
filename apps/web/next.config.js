/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@retasker/shared'],
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Отключаем статическую генерацию полностью
  experimental: {
    serverComponentsExternalPackages: ['styled-jsx'],
  },
  // Отключаем статическую генерацию для всех страниц
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig