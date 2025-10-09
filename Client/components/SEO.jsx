import Head from 'next/head';

export default function SEO({
  title = 'UnlimitedData GH | Premium Data Marketplace',
  description = "Ghana's premier platform for data resellers. Buy and sell data packages with unlimited possibilities, secure transactions, and instant delivery.",
  keywords = 'unlimited data ghana, data marketplace, ghana data resellers, buy data bundles, MTN data, Vodafone data, AirtelTigo data, Telecel data',
  ogImage = '/og-image.png',
  ogType = 'website',
  canonical,
  noindex = false
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://senyo-frontend-final-hg1kr9283-danaasamuel2023s-projects.vercel.app';
  const fullUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${baseUrl}${ogImage}`} />
      <meta property="og:site_name" content="UnlimitedData GH" />
      <meta property="og:locale" content="en_GH" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}${ogImage}`} />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="UnlimitedData GH" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#FFCC08" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      
      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//unlimitedata.onrender.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
    </Head>
  );
}
