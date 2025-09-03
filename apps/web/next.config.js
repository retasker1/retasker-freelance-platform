/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@retasker/shared'],
  output: 'standalone',
  trailingSlash: true,
  experimental: {
    serverComponentsExternalPackages: ['styled-jsx'],
  },
  generateStaticParams: false,
}

module.exports = nextConfig
