import '@/app/globals.css'
import { Inter, JetBrains_Mono } from "next/font/google";
import Footer from "@/component/footer";
import FloatingWhatsAppIcon from "@/component/groupIcon";
import PWAInstaller from "@/component/PWAInstaller";
import BottomNav from "@/component/BottomNav";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { ToastProvider } from "@/component/ToastNotification";
import ErrorBoundary from "@/component/ErrorBoundary";

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

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <Component {...pageProps} />
            <FloatingWhatsAppIcon />
            <Footer hideOnAdmin={true} />
            <BottomNav />
            <PWAInstaller />
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </div>
  );
}
