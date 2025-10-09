/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    trailingSlash: false,
    
    // Simple webpack configuration
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Basic watch options
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
          ignored: /node_modules/,
        };
      }
      return config;
    },
    
    // Basic optimizations
    experimental: {
      optimizeCss: true,
    },
};
  
export default nextConfig;
  