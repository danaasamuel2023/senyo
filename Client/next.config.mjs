/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: false,
    
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
  