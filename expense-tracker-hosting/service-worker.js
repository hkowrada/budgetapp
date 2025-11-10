// Service Worker for Family Expense Tracker PWA
// Version 2.0 - Full offline support, background sync, and push notifications

const CACHE_NAME = 'expense-tracker-v2.0';
const DATA_CACHE_NAME = 'expense-tracker-data-v2.0';

// Files to cache for offline use
const FILES_TO_CACHE = [
  './',
  './index.html',
  './api.php',
  './auth.php',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Handle API requests separately (network first, then cache)
  if (url.pathname.includes('api.php') || url.pathname.includes('auth.php')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone response and cache it
          const responseClone = response.clone();
          caches.open(DATA_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[ServiceWorker] Serving cached API response');
              return cachedResponse;
            }
            // Return offline response
            return new Response(
              JSON.stringify({
                success: false,
                message: 'You are offline. Some features may not work.',
                offline: true
              }),
              {
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // For other requests, use cache first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page or placeholder
          console.log('[ServiceWorker] Fetch failed, serving offline content');
          return new Response('Offline - Please check your connection', {
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

// Background Sync - sync data when connection returns
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync triggered');
  
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses());
  }
});

async function syncExpenses() {
  try {
    // Get pending sync data from IndexedDB or cache
    const cache = await caches.open(DATA_CACHE_NAME);
    const pendingData = await cache.match('pending-sync');
    
    if (pendingData) {
      const data = await pendingData.json();
      
      // Send to server
      const response = await fetch('./api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log('[ServiceWorker] Background sync successful');
        await cache.delete('pending-sync');
        
        // Notify all clients
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              message: 'Data synced successfully'
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  let notificationData = {
    title: 'Family Expense Tracker',
    body: 'You have a new notification',
    icon: './icon-192x192.png',
    badge: './icon-96x96.png',
    tag: 'expense-notification',
    requireInteraction: false
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('[ServiceWorker] Service Worker loaded');