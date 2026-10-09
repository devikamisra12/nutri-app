/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Railway deployment
  // This creates a self-contained build that doesn't need node_modules at runtime
  output: 'standalone',
};

module.exports = nextConfig;
