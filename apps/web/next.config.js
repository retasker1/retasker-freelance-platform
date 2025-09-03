/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@retasker/shared'],
  experimental: {
    serverComponentsExternalPackages: ['styled-jsx'],
  },
}

module.exports = nextConfig
