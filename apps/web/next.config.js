/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@retasker/shared'],
  experimental: {
    serverComponentsExternalPackages: ['styled-jsx'],
  },
  // Отключаем статическую генерацию полностью
  output: 'standalone',
  trailingSlash: true,
}

module.exports = nextConfig
