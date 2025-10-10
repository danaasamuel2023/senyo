/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: false,
    
    // Webpack configuration to fix module loading issues
    webpack: (config, { isServer }) => {
      // Fix for webpack module loading errors
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Optimize for development
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          crypto: false,
          stream: false,
          buffer: false,
        };
      }
      
      return config;
    },
    
    // Basic optimizations
    experimental: {
      optimizeCss: true,
    },
    
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
    }
};
  
export default nextConfig;
  