/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@retasker/shared'],
  experimental: {
    serverComponentsExternalPackages: ['styled-jsx'],
  },
  // Отключаем статическую генерацию для проблемных страниц
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
