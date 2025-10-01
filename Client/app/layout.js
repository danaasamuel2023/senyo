import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Navbar from "@/compoenent/nav";
import Footer from "@/compoenent/footer";
import AuthGuard from "@/component/AuthGuide";
import WhatsAppLink from "@/component/groupIcon";

// Font optimization with variable fonts for better performance
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
  adjustFontFallback: true,
});

// Enhanced metadata configuration with structured data
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddata.gh"),
  title: {
    default: "UnlimitedData GH | Premium Data Marketplace",
    template: "%s | UnlimitedData GH",
  },
  description: "Ghana's premier platform for data resellers. Buy and sell data packages with unlimited possibilities, secure transactions, and instant delivery.",
  keywords: [
    "unlimited data ghana",
    "data marketplace",
    "ghana data resellers",
    "buy data bundles",
    "sell data packages",
    "ghana telecom data",
    "instant data delivery",
    "wholesale data ghana",
    "MTN data bundles",
    "Vodafone data packages",
    "AirtelTigo data deals",
  ],
  authors: [{ name: "UnlimitedData GH Team", url: "https://www.unlimiteddata.gh" }],
  creator: "UnlimitedData GH",
  publisher: "UnlimitedData GH",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "Ef-n9jMB8qrIion-ddD_qPQpqd1syAOgKmuvhaBu_2o",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
  },
  openGraph: {
    title: "UnlimitedData GH | Ghana's Premium Data Marketplace",
    description: "Connect with top data resellers across Ghana. Experience unlimited data possibilities with secure, fast, and reliable transactions.",
    url: "https://www.unlimiteddata.gh",
    siteName: "UnlimitedData GH",
    images: [
      {
        url: "/images/og-unlimited-data.jpg",
        width: 1200,
        height: 630,
        alt: "UnlimitedData GH - Premium Data Marketplace",
        type: "image/jpeg",
      },
      {
        url: "/images/og-unlimited-data-square.jpg",
        width: 600,
        height: 600,
        alt: "UnlimitedData GH Logo",
        type: "image/jpeg",
      },
    ],
    locale: "en_GH",
    type: "website",
    countryName: "Ghana",
  },
  twitter: {
    card: "summary_large_image",
    title: "UnlimitedData GH | Premium Data Marketplace",
    description: "Ghana's #1 platform for data resellers. Unlimited possibilities, secure transactions, instant delivery.",
    site: "@UnlimitedDataGH",
    creator: "@UnlimitedDataGH",
    images: {
      url: "/images/twitter-unlimited-data.jpg",
      alt: "UnlimitedData GH",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.unlimiteddata.gh",
    languages: {
      "en-GH": "https://www.unlimiteddata.gh",
      "en": "https://www.unlimiteddata.gh/en",
      "tw-GH": "https://www.unlimiteddata.gh/tw",
    },
    types: {
      "application/rss+xml": "https://www.unlimiteddata.gh/feed.xml",
    },
  },
  category: "Technology",
  classification: "Data Services",
  other: {
    "msapplication-TileImage": "/images/ms-icon-144x144.png",
    "msapplication-config": "/browserconfig.xml",
  },
};

// Enhanced viewport configuration with modern settings
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#DC2626" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// JSON-LD structured data for better SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "UnlimitedData GH",
  description: "Ghana's premier platform for data resellers",
  url: "https://www.unlimiteddata.gh",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.unlimiteddata.gh/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  publisher: {
    "@type": "Organization",
    name: "UnlimitedData GH",
    logo: {
      "@type": "ImageObject",
      url: "https://www.unlimiteddata.gh/logo.png"
    }
  }
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en-GH" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Critical CSS for preventing FOUC */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-primary: #DC2626;
              --color-primary-dark: #991B1B;
              --color-black: #000000;
              --color-black-soft: #0A0A0A;
              --color-gray-dark: #111111;
            }
            body { 
              opacity: 0; 
              transition: opacity 0.3s ease-in-out;
            }
            body.ready { 
              opacity: 1; 
            }
          `
        }} />
        
        {/* Modern PWA meta tags */}
        <meta name="application-name" content="UnlimitedData GH" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="UnlimitedData" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-navbutton-color" content="#DC2626" />
        <meta name="msapplication-starturl" content="/" />
        
        {/* Enhanced color scheme for modern browsers */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#DC2626" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
        <meta name="msapplication-TileColor" content="#DC2626" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Security headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Preconnect to external domains for optimal performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Modern favicon setup with dark mode support */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-dark.ico" sizes="32x32" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#DC2626" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`
          font-sans antialiased min-h-screen flex flex-col
          bg-gradient-to-br from-black via-gray-950 to-red-950
          text-gray-100 selection:bg-red-600 selection:text-white
          relative overflow-x-hidden
        `}
      >
        {/* Initialize body opacity */}
        <Script
          id="body-ready"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `document.body.classList.add('ready');`
          }}
        />
        
        {/* Modern layout structure with error boundary */}
        <AuthGuard>
          {/* Premium gradient overlay */}
          <div className="fixed inset-0 -z-20 bg-black" />
          <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-black via-red-950/20 to-black" />
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Primary grid pattern */}
            <div className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-red-900/20 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]">
              <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <pattern
                    id="grid-pattern"
                    width={200}
                    height={200}
                    x="50%"
                    y={-1}
                    patternUnits="userSpaceOnUse"
                  >
                    <path d="M100 200V.5M.5 .5H200" fill="none" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" strokeWidth={0} fill="url(#grid-pattern)" />
              </svg>
            </div>
            
            {/* Animated red accent dots */}
            <div className="absolute right-[max(50%,25rem)] bottom-0 h-[64rem] w-[128rem] translate-x-1/2 stroke-red-600/10 [mask-image:radial-gradient(64rem_64rem_at_bottom,white,transparent)]">
              <svg className="absolute inset-0 h-full w-full animate-pulse" aria-hidden="true">
                <defs>
                  <pattern
                    id="dot-pattern"
                    width={50}
                    height={50}
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx={25} cy={25} r={2} fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dot-pattern)" />
              </svg>
            </div>
          </div>
          
          <Navbar />
          
          <main className="flex-grow relative z-0">
            {/* Noise texture overlay for premium feel */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.015]">
              <svg width="100%" height="100%">
                <filter id="noiseFilter">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
                  <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
              </svg>
            </div>
            
            {/* Main content wrapper */}
            <div className="relative">
              {children}
            </div>
            
            {/* WhatsApp floating button */}
            <WhatsAppLink />
          </main>
          
          <Footer />
        </AuthGuard>
        
        {/* Google Analytics with enhanced tracking */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
                cookie_flags: 'SameSite=None;Secure'
              });
            `,
          }}
        />
        
        {/* Enhanced Web Vitals monitoring */}
        <Script
          id="web-vitals"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  entries.forEach(entry => {
                    // Send to analytics
                    if (window.gtag) {
                      window.gtag('event', entry.name, {
                        value: Math.round(entry.value),
                        metric_id: entry.id,
                        metric_value: entry.value,
                        metric_delta: entry.delta,
                      });
                    }
                  });
                });
                
                // Observe all Core Web Vitals
                try {
                  observer.observe({ type: 'web-vital', buffered: true });
                  observer.observe({ type: 'paint', buffered: true });
                  observer.observe({ type: 'layout-shift', buffered: true });
                  observer.observe({ type: 'largest-contentful-paint', buffered: true });
                  observer.observe({ type: 'first-input', buffered: true });
                } catch (e) {
                  console.error('[Performance Observer]', e);
                }
              }
            `,
          }}
        />
        
        {/* Error tracking */}
        <Script
          id="error-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', (e) => {
                if (window.gtag) {
                  window.gtag('event', 'exception', {
                    description: e.message,
                    fatal: false,
                    error: {
                      message: e.message,
                      filename: e.filename,
                      lineno: e.lineno,
                      colno: e.colno,
                    }
                  });
                }
              });
              
              window.addEventListener('unhandledrejection', (e) => {
                if (window.gtag) {
                  window.gtag('event', 'exception', {
                    description: e.reason,
                    fatal: false,
                  });
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}