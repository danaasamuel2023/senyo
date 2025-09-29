'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Home, Search, ArrowLeft, RefreshCw, 
  Compass, MapPin, AlertTriangle, Phone, Mail,
  MessageCircle, ChevronRight, Zap, WifiOff,
  Navigation, HelpCircle, Clock, Calendar
} from 'lucide-react';

// Animated Background Elements
const FloatingElement = ({ delay, duration, children }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [-20, 20, -20],
      rotate: [0, 10, -10, 0]
    }}
    transition={{
      duration: duration || 6,
      delay: delay || 0,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

// Popular Pages Component
const PopularPages = ({ onNavigate }) => {
  const pages = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, description: 'Go to main dashboard' },
    { path: '/bulk-purchase', label: 'Bulk Purchase', icon: Zap, description: 'Buy data in bulk' },
    { path: '/data-purchases', label: 'Purchase History', icon: Clock, description: 'View your orders' },
    { path: '/wallet', label: 'Wallet', icon: Calendar, description: 'Manage your funds' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
      {pages.map((page, index) => {
        const Icon = page.icon;
        return (
          <motion.button
            key={page.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(page.path)}
            className="flex items-start p-4 bg-white dark:bg-gray-900 rounded-2xl border-2 border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-700 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-shadow">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {page.label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {page.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        );
      })}
    </div>
  );
};

// Contact Support Component
const ContactSupport = () => {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSupport(true)}
        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors flex items-center"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact Support
      </motion.button>

      <AnimatePresence>
        {showSupport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSupport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-red-200 dark:border-red-900 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Get Support
              </h3>
              
              <div className="space-y-4">
                <a
                  href="tel:+233246783840"
                  className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
                >
                  <Phone className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Call Us</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">+233 246 783 840</p>
                  </div>
                </a>
                
                <a
                  href="mailto:support@datahustle.com"
                  className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
                >
                  <Mail className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Support</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">support@datahustle.com</p>
                  </div>
                </a>
                
                <a
                  href="https://wa.me/233246783840"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
                >
                  <MessageCircle className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Chat with us</p>
                  </div>
                </a>
              </div>
              
              <button
                onClick={() => setShowSupport(false)}
                className="mt-6 w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-2xl font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Main 404 Component
export default function Error404Page() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(false);

  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRedirect && countdown === 0) {
      router.push('/dashboard');
    }
  }, [countdown, autoRedirect, router]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search logic or redirect to search results
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white dark:from-gray-900 dark:via-red-950 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0} duration={8}>
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-200/20 dark:bg-red-800/20 rounded-full blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={2} duration={10}>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-rose-200/20 dark:bg-rose-800/20 rounded-full blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={1} duration={7}>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-red-300/10 dark:bg-red-700/10 rounded-full blur-2xl" />
        </FloatingElement>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl w-full"
        >
          {/* 404 Display */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="relative inline-block">
              <motion.h1
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600 select-none"
              >
                404
              </motion.h1>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl"
              >
                <WifiOff className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 md:p-12 border border-red-200 dark:border-red-900"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Page Not Found
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
              <p className="text-sm text-red-500 dark:text-red-400 font-medium">
                Error Code: 404 | Resource Unavailable
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for pages or features..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-red-400 focus:border-red-400 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-rose-700 transition-all"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-medium shadow-lg hover:from-red-600 hover:to-rose-700 transition-all"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </motion.button>
            </div>

            {/* Popular Pages */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Compass className="w-6 h-6 mr-2 text-red-500" />
                Popular Pages
              </h3>
              <PopularPages onNavigate={handleNavigate} />
            </div>

            {/* Auto Redirect Option */}
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {autoRedirect 
                      ? `Redirecting to dashboard in ${countdown} seconds...` 
                      : 'Enable auto-redirect to dashboard?'}
                  </span>
                </div>
                <button
                  onClick={() => setAutoRedirect(!autoRedirect)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    autoRedirect 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {autoRedirect ? 'Cancel' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Flame className="w-4 h-4 text-red-500" />
                <span className="text-sm">Powered by DATAHUSTLE</span>
              </div>
              <ContactSupport />
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lost? Don't worry, we'll help you find your way back!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Next.js App Router Setup (app/not-found.js or app/[...not-found]/page.js)
export { Error404Page };