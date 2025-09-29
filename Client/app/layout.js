import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/compoenent/nav";
import Footer from "@/compoenent/footer";
import AuthGuard from "@/component/AuthGuide";
import WhatsAppLink from "@/component/groupIcon";
import Script from "next/script";

// Modern font configuration
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"],
});

// Modern metadata configuration
export const metadata = {
  metadataBase: new URL("https://www.unlimiteddata.gh"),
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
  ],
  authors: [{ name: "UnlimitedData GH Team" }],
  creator: "UnlimitedData GH",
  publisher: "UnlimitedData GH",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "Ef-n9jMB8qrIion-ddD_qPQpqd1syAOgKmuvhaBu_2o",
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
    googleBot: {
      index: true,
      follow: true,
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
    },
  },
  category: "Technology",
  classification: "Data Services",
};

// Modern viewport configuration
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#DC2626" },
    { media: "(prefers-color-scheme: dark)", color: "#991B1B" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en-GH" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Modern PWA meta tags */}
        <meta name="application-name" content="UnlimitedData GH" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UnlimitedData" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Modern color scheme for browsers */}
        <meta name="theme-color" content="#DC2626" />
        <meta name="msapplication-TileColor" content="#DC2626" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Modern favicon setup */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`
          font-sans antialiased min-h-screen flex flex-col
          bg-gradient-to-br from-white to-red-50
          text-gray-900 selection:bg-red-500 selection:text-white
        `}
      >
        {/* Modern layout structure */}
        <AuthGuard>
          <Navbar />
          <main className="flex-grow relative">
            {/* Background pattern for modern look */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-red-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]">
                <svg
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
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
                  <rect
                    width="100%"
                    height="100%"
                    strokeWidth={0}
                    fill="url(#grid-pattern)"
                  />
                </svg>
              </div>
            </div>
            
            {/* Main content */}
            <div className="relative">
              {children}
            </div>
            
            {/* WhatsApp floating button */}
            <WhatsAppLink />
          </main>
          <Footer />
        </AuthGuard>
        
        {/* Modern analytics scripts */}
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
        
        {/* Performance monitoring */}
        <Script
          id="web-vitals"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('load', () => {
                  // Web Vitals tracking
                  if ('PerformanceObserver' in window) {
                    try {
                      const po = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                          // Log to analytics
                          console.log('[Performance]', entry);
                        }
                      });
                      po.observe({ type: 'paint', buffered: true });
                    } catch (e) {
                      console.error('[Performance Observer Error]', e);
                    }
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}