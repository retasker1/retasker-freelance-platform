/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@retasker/shared'],
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['styled-jsx'],
  },
}

module.exports = nextConfig
