import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Footer from "@/component/footer";
import WhatsAppLink from "@/component/groupIcon";
import PWAInstaller from "@/component/PWAInstaller";
import BottomNav from "@/component/BottomNav";
// import PullToRefreshWrapper from "@/component/PullToRefreshWrapper"; // Temporarily disabled
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { ToastProvider } from "@/component/ToastNotification";
import ErrorBoundary from "@/component/ErrorBoundary";
// Temporarily disabled to fix webpack errors
// import errorMonitor from "@/utils/errorMonitor";
// import performanceMonitor from "@/utils/performanceMonitor";
// import testRunner from "@/utils/testRunner";
// import "@/utils/consoleErrorSuppression";

// Font optimization with variable fonts for better performance
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: false, // Disable automatic preload to prevent warnings
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700", "800"],
  preload: false, // Disable automatic preload to prevent warnings
  adjustFontFallback: true,
});

// Enhanced metadata configuration with structured data
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com"),
  title: {
    default: "Cheap Databundle Ghana | Unlimited Data Deals | Best Prices",
    template: "%s | Cheap Databundle Ghana",
  },
  description: "Get the cheapest databundle deals in Ghana. Unlimited data packages starting from ₵5. MTN, Vodafone, AirtelTigo & Telecel. Instant delivery, secure payment.",
  keywords: [
    "databundle ghana",
    "cheap data ghana", 
    "unlimited data ghana",
    "databundle cheap",
    "cheap unlimited data",
    "best databundle deals",
    "affordable data bundles",
    "cheap data bundles ghana",
    "unlimited data packages",
    "databundle marketplace",
    "MTN databundle",
    "Vodafone databundle", 
    "AirtelTigo databundle",
    "Telecel databundle",
    "wholesale databundle",
    "bulk databundle",
    "instant databundle",
    "secure databundle",
    "reliable databundle",
    "fast databundle delivery",
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
  authors: [{ name: "UnlimitedData GH Team", url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com" }],
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
    title: "Cheap Databundle Ghana | Best Unlimited Data Deals 2024",
    description: "Get the cheapest databundle deals in Ghana. Unlimited data packages from ₵5. MTN, Vodafone, AirtelTigo & Telecel. Instant delivery.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com",
    siteName: "UnlimitedData GH",
    images: [
      {
        url: "/icon-512.svg",
        width: 512,
        height: 512,
        alt: "UnlimitedData GH - Premium Data Marketplace",
        type: "image/svg+xml",
      },
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "UnlimitedData GH Logo",
        type: "image/svg+xml",
      },
    ],
    locale: "en_GH",
    type: "website",
    countryName: "Ghana",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cheap Databundle Ghana | Best Unlimited Data Deals",
    description: "Get the cheapest databundle deals in Ghana. Unlimited data packages from ₵5. Instant delivery, secure payment.",
    site: "@UnlimitedDataGH",
    creator: "@UnlimitedDataGH",
    images: {
      url: "/icon-512.svg",
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
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com",
    languages: {
      "en-GH": process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com",
      "en": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com"}/en`,
      "tw-GH": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com"}/tw`,
    },
    types: {
      "application/rss+xml": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com"}/feed.xml`,
    },
  },
  category: "Technology",
  classification: "Data Services",
  other: {
    "msapplication-TileImage": "/images/ms-icon-144x144.png",
    "msapplication-config": "/browserconfig.xml",
  },
};

// Enhanced viewport configuration with modern settings - OPTIMIZED FOR MOBILE
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFCC08" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// JSON-LD structured data for better SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cheap Databundle Ghana",
  description: "Ghana's premier platform for cheap databundle deals and unlimited data packages",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com"}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  publisher: {
    "@type": "Organization",
    name: "UnlimitedData GH",
    email: "Unlimiteddatagh@gmail.com",
    telephone: "+233256702995",
    logo: {
      "@type": "ImageObject",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.unlimiteddatagh.com"}/icon.svg`
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+233256702995",
      contactType: "customer support",
      email: "Unlimiteddatagh@gmail.com",
      areaServed: "GH",
      availableLanguage: "English"
    }
  }
};

// Product structured data for databundle services
const productStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Cheap Databundle Ghana",
  "description": "Affordable unlimited data packages for all networks in Ghana. Best prices for MTN, Vodafone, AirtelTigo & Telecel databundles.",
  "brand": {
    "@type": "Brand",
    "name": "UnlimitedData GH"
  },
  "offers": {
    "@type": "Offer",
    "price": "5.00",
    "priceCurrency": "GHS",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2024-12-31",
    "seller": {
      "@type": "Organization",
      "name": "UnlimitedData GH"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "category": "Telecommunications",
  "keywords": "databundle ghana, cheap data ghana, unlimited data ghana, MTN databundle, Vodafone databundle"
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en-GH" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Critical CSS for preventing FOUC - MOBILE OPTIMIZED */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              /* MTN Brand Colors */
              --color-mtn-yellow: #FFCC08;
              --color-mtn-yellow-dark: #f5c500;
              --color-mtn-yellow-light: #ffd633;
              --color-black: #000000;
              --color-black-soft: #0A0A0A;
              --color-gray-dark: #111111;
              
              /* Light theme colors */
              --color-bg-primary: #ffffff;
              --color-bg-secondary: #f9fafb;
              --color-bg-tertiary: #f3f4f6;
              --color-text-primary: #111827;
              --color-text-secondary: #4b5563;
              --color-border: #e5e7eb;
              --color-accent: #FFCC08;
              --color-accent-hover: #f5c500;
            }
            
            /* Dark theme colors */
            [data-theme='dark'] {
              --color-bg-primary: #000000;
              --color-bg-secondary: #0A0A0A;
              --color-bg-tertiary: #111111;
              --color-text-primary: #f9fafb;
              --color-text-secondary: #d1d5db;
              --color-border: #1f2937;
              --color-accent: #FFCC08;
              --color-accent-hover: #ffd633;
            }
            
            /* Smooth theme transition - reduced for mobile performance */
            * {
              transition: background-color 0.2s ease, 
                          border-color 0.2s ease, 
                          color 0.2s ease;
            }
            
            /* Prevent flash of unstyled content */
            body { 
              opacity: 0; 
              transition: opacity 0.2s ease-in-out;
              background-color: var(--color-bg-primary);
              color: var(--color-text-primary);
              /* Mobile optimizations */
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              -webkit-tap-highlight-color: rgba(255, 204, 8, 0.1);
            }
            body.ready { 
              opacity: 1; 
            }
            
            /* Custom selection colors */
            ::selection {
              background-color: var(--color-mtn-yellow);
              color: var(--color-black);
            }
            
            /* Custom scrollbar with MTN colors - Desktop only */
            @media (min-width: 768px) {
              ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              
              ::-webkit-scrollbar-track {
                background: var(--color-bg-secondary);
              }
              
              ::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, var(--color-mtn-yellow), var(--color-mtn-yellow-dark));
                border-radius: 4px;
              }
              
              ::-webkit-scrollbar-thumb:hover {
                background: var(--color-mtn-yellow-dark);
              }
              
              /* Firefox scrollbar */
              * {
                scrollbar-width: thin;
                scrollbar-color: var(--color-mtn-yellow) var(--color-bg-secondary);
              }
            }
            
            /* Mobile-specific optimizations */
            @media (max-width: 767px) {
              /* Hide scrollbar on mobile for cleaner look */
              ::-webkit-scrollbar {
                display: none;
              }
              
              * {
                scrollbar-width: none;
              }
              
              /* Optimize touch interactions */
              button, a, input, select, textarea {
                touch-action: manipulation;
              }
              
              /* Prevent text size adjustment on orientation change */
              html {
                -webkit-text-size-adjust: 100%;
                text-size-adjust: 100%;
              }
            }
            
            /* Safe area insets for notched devices */
            @supports (padding: env(safe-area-inset-top)) {
              body {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
              }
            }
          `
        }} />
        
        {/* Theme initialization script - must run before body renders */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (typeof window === 'undefined') return;
              
              try {
                const savedTheme = localStorage.getItem('app_theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = savedTheme || (prefersDark ? 'dark' : 'light');
                
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.classList.toggle('dark', theme === 'dark');
                
                // Update meta theme-color
                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor) {
                  metaThemeColor.content = theme === 'dark' ? '#000000' : '#FFCC08';
                }
              } catch (error) {
                console.warn('Theme initialization failed:', error);
              }
            })();
          `
        }} />
        
        {/* Modern PWA meta tags - MOBILE OPTIMIZED */}
        <meta name="application-name" content="UnlimitedData GH" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="UnlimitedData" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-navbutton-color" content="#FFCC08" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Enhanced color scheme for modern browsers - MTN Colors */}
        <meta name="theme-color" content="#FFCC08" />
        <meta name="msapplication-TileColor" content="#FFCC08" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Security headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Preconnect to external domains for optimal performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Font preload optimization with proper as attribute */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" 
          as="style" 
        />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" 
        />
        
        {/* Modern favicon setup with UnlimitedData GH logo */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.svg" />
        <link rel="mask-icon" href="/icon.svg" color="#FFCC08" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
        />
      </head>
      <body
        className="font-sans antialiased min-h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] selection:bg-[#FFCC08] selection:text-black relative overflow-x-hidden transition-colors duration-300"
        suppressHydrationWarning
      >
        {/* Initialize body opacity and error monitoring */}
        <Script
          id="body-ready"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              document.body.classList.add('ready');
              // Error monitoring temporarily disabled
              // if (typeof window !== 'undefined' && window.errorMonitor) {
              //   window.errorMonitor.init();
              // }
            `
          }}
        />
        
        {/* Modern layout structure with error boundary */}
        <ThemeProvider>
          <ToastProvider>
            {/* Dynamic background based on theme - SIMPLIFIED FOR MOBILE */}
            <div className="fixed inset-0 -z-20 bg-[var(--color-bg-primary)] dark:bg-black transition-colors duration-300" />
            
            {/* Light theme background gradient - OPTIMIZED */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-[#FFCC08]/5 to-white dark:from-black dark:via-[#FFCC08]/10 dark:to-black transition-opacity duration-300" />
            
            {/* Animated background pattern - SIMPLIFIED FOR MOBILE PERFORMANCE */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              {/* Primary grid pattern - Hidden on mobile for performance */}
              <div className="hidden md:block absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-[#FFCC08]/20 dark:stroke-[#FFCC08]/10 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]">
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
              
              {/* Animated yellow accent dots - Hidden on mobile */}
              <div className="hidden md:block absolute right-[max(50%,25rem)] bottom-0 h-[64rem] w-[128rem] translate-x-1/2 stroke-[#FFCC08]/10 dark:stroke-[#FFCC08]/5 [mask-image:radial-gradient(64rem_64rem_at_bottom,white,transparent)]">
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
              
              {/* MTN-style decorative elements - Simplified for mobile */}
              <div className="absolute top-10 left-5 w-20 h-20 md:top-20 md:left-10 md:w-32 md:h-32 bg-[#FFCC08]/10 rounded-full blur-2xl md:blur-3xl animate-pulse dark:bg-[#FFCC08]/5" />
              <div className="absolute bottom-10 right-5 w-24 h-24 md:bottom-20 md:right-10 md:w-48 md:h-48 bg-[#FFCC08]/10 rounded-full blur-2xl md:blur-3xl animate-pulse delay-1000 dark:bg-[#FFCC08]/5" />
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFCC08]/5 rounded-full blur-3xl animate-pulse delay-500 dark:bg-[#FFCC08]/3" />
            </div>
            
            
            {/* Main content - MOBILE OPTIMIZED SPACING */}
            <main className="flex-grow relative z-0 pb-20 md:pb-6 px-3 sm:px-4 md:px-6">
              {/* Noise texture overlay - Reduced opacity on mobile */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.01] md:opacity-[0.015] dark:opacity-[0.015] dark:md:opacity-[0.02]">
                <svg width="100%" height="100%">
                  <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
                    <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
              </div>
              
              {/* Main content wrapper - MOBILE FRIENDLY */}
              <div className="relative max-w-7xl mx-auto">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
              
              {/* WhatsApp floating button - Mobile optimized position */}
              <WhatsAppLink />
            </main>
            
            <Footer hideOnAdmin={true} />
            
            {/* Bottom Navigation for Mobile - ENHANCED */}
            <BottomNav />
            
            {/* PWA Install Prompt and Push Notifications */}
            <PWAInstaller />
          </ToastProvider>
        </ThemeProvider>
        
        {/* PWA and Service Worker Global Configuration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent multiple Service Worker registrations
              if (typeof window !== 'undefined') {
                window.serviceWorkerRegistered = window.serviceWorkerRegistered || false;
                window.beforeInstallPromptListenerAdded = window.beforeInstallPromptListenerAdded || false;
                window.appInstalledListenerAdded = window.appInstalledListenerAdded || false;
                window.installPromptShown = window.installPromptShown || false;
                
                // Global PWA install prompt handler
                window.globalDeferredPrompt = null;
                
                // Listen for install prompt globally
                if (!window.beforeInstallPromptListenerAdded && 'serviceWorker' in navigator) {
                  window.addEventListener('beforeinstallprompt', (e) => {
                    console.log('Global PWA install prompt received');
                    e.preventDefault();
                    window.globalDeferredPrompt = e;
                  });
                  window.beforeInstallPromptListenerAdded = true;
                }
              }
            `,
          }}
        />

        {/* Google Analytics with enhanced tracking - only load if GA ID is configured */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
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
                    page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
                    cookie_flags: 'SameSite=None;Secure'
                  });
                `,
              }}
            />
          </>
        )}
        
        {/* Enhanced Web Vitals monitoring - only if GA is configured */}
        {process.env.NEXT_PUBLIC_GA_ID && (
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
        )}
        
        {/* Error tracking - only if GA is configured */}
        {process.env.NEXT_PUBLIC_GA_ID && (
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
        )}
      </body>
    </html>
  );
}