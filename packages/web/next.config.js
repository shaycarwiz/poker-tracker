/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      // Exclude /api/session from being proxied to the API server
      // {
      //   source: '/api/auth/',
      //   destination: '/api/auth/',
      // },
      // // Proxy all other /api/* requests to the API server
      // {
      //   source: '/api/:path*',
      //   destination: 'http://localhost:4000/api/v1/:path*',
      // },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any custom webpack configuration here
    return config;
  },
};

// Bundle analyzer
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}
