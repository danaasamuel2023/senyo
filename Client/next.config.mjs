/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: false,
    
    // Webpack configuration to fix module loading issues
    webpack: (config, { isServer, dev }) => {
      // Comprehensive fallback configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        path: false,
        child_process: false,
        worker_threads: false,
        perf_hooks: false,
      };
      
      // Fix for webpack module loading errors
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': new URL('.', import.meta.url).pathname,
      };
      
      // Optimize module resolution
      config.resolve.modules = ['node_modules', '.'];
      
      // Fix for development mode webpack issues
      if (dev) {
        config.optimization = {
          ...config.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        };
      }
      
      // Ignore problematic modules
      config.externals = config.externals || [];
      if (!isServer) {
        config.externals.push({
          'utf-8-validate': 'commonjs utf-8-validate',
          'bufferutil': 'commonjs bufferutil',
        });
      }
      
      return config;
    },
    
    // Basic optimizations
    experimental: {
      optimizeCss: true,
      esmExternals: 'loose',
    },
    
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
    }
};
  
export default nextConfig;
  