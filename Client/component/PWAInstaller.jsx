'use client';

import { useEffect, useState } from 'react';
import { X, Download, Bell } from 'lucide-react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after 30 seconds of browsing
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
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
              onClick={() => setShowInstallPrompt(false)}
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

