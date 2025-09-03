/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@retasker/shared'],
  experimental: {
    serverComponentsExternalPackages: ['styled-jsx'],
  },
  // Отключаем статическую генерацию полностью
  output: 'standalone',
  trailingSlash: true,
  // Отключаем статическую генерацию для всех страниц
  generateStaticParams: false,
  // Отключаем ISR
  revalidate: false,
}

module.exports = nextConfig
