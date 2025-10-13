// Minimal Service Worker for UnlimitedData GH PWA
// This version avoids potential redirect issues
// Fixed: Added redirect handling to prevent FetchEvent warnings

const CACHE_NAME = 'unlimiteddata-minimal-v1';

// Essential assets only
const ESSENTIAL_ASSETS = [
  '/',
  '/manifest.json'
];

// Install event - minimal caching
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Minimal version installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching essential assets');
      return cache.addAll(ESSENTIAL_ASSETS).catch((error) => {
        console.log('[Service Worker] Essential cache failed:', error);
        // Don't fail installation if caching fails - try individual caching
        return Promise.allSettled(
          ESSENTIAL_ASSETS.map(url => 
            cache.add(url).catch(err => 
              console.log(`[Service Worker] Failed to cache ${url}:`, err)
            )
          )
        );
      });
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Minimal version activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - minimal caching strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    // Try network first, fallback to cache
    // FIX: Add redirect mode to handle server redirects
    fetch(event.request, { 
      redirect: 'follow',
      mode: 'cors',
      credentials: 'same-origin'
    })
      .then((response) => {
        // Only cache successful responses that aren't redirected
        if (response.status === 200 && response.type === 'basic' && !response.redirected) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((error) => {
              console.log('[Service Worker] Cache put failed:', error);
            });
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Return a basic offline response for navigation requests
          if (event.request.mode === 'navigate') {
            return new Response('Offline - Please check your connection', {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            });
          }
        });
      })
  );
});

// Push notification event (minimal)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  const options = {
    body: 'New notification from UnlimitedData GH',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: 'unlimiteddata-notification'
  };

  event.waitUntil(
    self.registration.showNotification('UnlimitedData GH', options)
  );
});

console.log('[Service Worker] Minimal version loaded successfully');
