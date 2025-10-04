export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unlimiteddata.gh';
  
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
