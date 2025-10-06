/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Ensure compatibility with Render
    reactStrictMode: true,
    trailingSlash: false,
    
    // Comprehensive webpack configuration to fix all development issues
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Optimize watch options for better file watching
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
          ignored: /node_modules/,
        };
        
        // Comprehensive warning suppression
        config.ignoreWarnings = [
          { module: /webpack\/hot\/update/ },
          { message: /webpack\.hot-update\.json/ },
          { message: /Fast Refresh had to perform a full reload/ },
          { message: /webpack\/hot\/update\.js/ },
          { message: /Chrome DevTools/ },
          { message: /\.well-known/ },
          { message: /hot-update/ },
          { message: /Fast Refresh/ },
          { message: /webpack\/hot/ },
          { message: /\.hot-update/ },
          { message: /devIndicators/ },
          { message: /buildActivity/ },
          { message: /buildActivityPosition/ },
          { message: /deprecated.*configurable/ },
          { message: /has been renamed/ },
          { message: /conflicts with/ }
        ];
        
        // Override console methods to suppress specific warnings
        const originalWarn = console.warn;
        console.warn = function(...args) {
          const message = args.join(' ');
          if (
            message.includes('Fast Refresh') ||
            message.includes('webpack.hot-update') ||
            message.includes('Chrome DevTools') ||
            message.includes('.well-known') ||
            message.includes('hot-update') ||
            message.includes('devIndicators') ||
            message.includes('buildActivity') ||
            message.includes('buildActivityPosition')
          ) {
            return; // Suppress these warnings
          }
          originalWarn.apply(console, args);
        };
      }
      return config;
    },
    
    // Additional optimizations
    experimental: {
      optimizeCss: true,
      optimizePackageImports: ['lucide-react']
    },
    
    // Redirects for Chrome DevTools requests
    async redirects() {
      return [
        {
          source: '/.well-known/appspecific/com.chrome.devtools.json',
          destination: '/404',
          permanent: false,
        },
      ];
    },
    
    // Suppress Next.js development warnings and optimize performance
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
};
  
export default nextConfig;
  