/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Ensure compatibility with Render
    reactStrictMode: true,
    trailingSlash: false,
    // Optimize webpack for better performance and fix Fast Refresh issues
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
        
        // Suppress webpack hot-update 404 warnings and Fast Refresh issues
        config.ignoreWarnings = [
          { module: /webpack\/hot\/update/ },
          { message: /webpack\.hot-update\.json/ },
          { message: /Fast Refresh had to perform a full reload/ },
          { message: /webpack\/hot\/update\.js/ }
        ];
      }
      return config;
    },
    // Additional optimizations
    experimental: {
      optimizeCss: true,
      optimizePackageImports: ['lucide-react']
    }
};
  
  export default nextConfig;
  