export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://senyo-frontend-final-hg1kr9283-danaasamuel2023s-projects.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/agent/dashboard',
          '/api/',
          '/admin-*',
          '/verification/*',
          '/payment/*'
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
