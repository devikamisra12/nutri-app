/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/api/chat': ['./node_modules/pg/**/*'],
    },
  },
};

module.exports = nextConfig;
