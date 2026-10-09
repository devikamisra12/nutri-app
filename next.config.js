/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway/Docker needs standalone. Vercel must not use it or routes 404.
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  experimental: {
    outputFileTracingIncludes: {
      '/api/chat': ['./node_modules/pg/**/*'],
    },
  },
};

module.exports = nextConfig;
