'use client';

import { useEffect, useState } from 'react';
import { X, Download, Bell } from 'lucide-react';

// Global flags to prevent multiple registrations
if (typeof window !== 'undefined') {
  window.serviceWorkerRegistered = window.serviceWorkerRegistered || false;
  window.beforeInstallPromptListenerAdded = window.beforeInstallPromptListenerAdded || false;
  window.appInstalledListenerAdded = window.appInstalledListenerAdded || false;
  window.installPromptShown = window.installPromptShown || false;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return; // Exit early if already installed
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Register service worker only once
    if ('serviceWorker' in navigator && !window.serviceWorkerRegistered) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          window.serviceWorkerRegistered = true;
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('PWA install prompt available - custom banner will appear shortly');
      
      // Show install prompt after 3 seconds of browsing (faster for better UX)
      setTimeout(() => {
        if (!isInstalled && !window.installPromptShown) {
          setShowInstallPrompt(true);
          window.installPromptShown = true;
          console.log('PWA install banner displayed');
        }
      }, 3000);
    };

    // Only add listener if not already added
    if (!window.beforeInstallPromptListenerAdded) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.beforeInstallPromptListenerAdded = true;
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('PWA installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    if (!window.appInstalledListenerAdded) {
      window.addEventListener('appinstalled', handleAppInstalled);
      window.appInstalledListenerAdded = true;
    }

    return () => {
      // Cleanup is handled by the global flags
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    } finally {
      // Clear the deferred prompt
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      window.installPromptShown = false;
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    window.installPromptShown = false;
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      // Subscribe to push notifications
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // This is a placeholder - you'll need to implement your push subscription logic
        console.log('Push notification enabled');
        
        // Show a test notification
        new Notification('UnlimitedData GH', {
          body: 'Notifications enabled! You\'ll receive updates on your orders.',
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        });
      }
    }
  };

  if (isInstalled && notificationPermission === 'granted') {
    return null;
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-2xl shadow-2xl border border-white/20">
            <button
              onClick={handleDismissInstall}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Download size={24} />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Install UnlimitedData GH</h3>
                <p className="text-sm text-white/90 mb-3">
                  Install our app for faster access, offline support, and push notifications!
                </p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-white text-purple-600 font-semibold py-2 px-4 rounded-xl hover:bg-gray-100 transition"
                  >
                    Install
                  </button>
                  <button
                    onClick={() => setShowInstallPrompt(false)}
                    className="px-4 py-2 hover:bg-white/10 rounded-xl transition"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Permission Prompt */}
      {isInstalled && notificationPermission === 'default' && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 rounded-2xl shadow-2xl border border-white/20">
            <button
              onClick={() => setNotificationPermission('denied')}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Bell size={24} />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Enable Notifications</h3>
                <p className="text-sm text-white/90 mb-3">
                  Get instant updates on your orders and special offers!
                </p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={requestNotificationPermission}
                    className="flex-1 bg-white text-green-600 font-semibold py-2 px-4 rounded-xl hover:bg-gray-100 transition"
                  >
                    Enable
                  </button>
                  <button
                    onClick={() => setNotificationPermission('denied')}
                    className="px-4 py-2 hover:bg-white/10 rounded-xl transition"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

