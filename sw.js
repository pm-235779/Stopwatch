// Service Worker for Enhanced Stopwatch & Timer Suite
const CACHE_NAME = 'stopwatch-v1.0.0';
const STATIC_CACHE = 'stopwatch-static-v1.0.0';
const DYNAMIC_CACHE = 'stopwatch-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/pomodoro/index.html',
  '/custom_timer/timer.html',
  '/style.css',
  '/pomodoro/index.css',
  '/custom_timer/timer.css',
  '/js/ui.js',
  '/js/theme.js',
  '/js/soundController.js',
  '/js/stopwatch.js',
  '/js/pomodoro.js',
  '/js/customTimer.js',
  '/js/settings.js',
  '/jquery.js',
  '/fonts/digital-7.ttf',
  '/audio/sound_trim.mp3',
  '/audio/beep_cut.mp3',
  '/img/favicon.png',
  '/img/logo.gif',
  '/img/Pomodoro.png',
  '/img/GitHub.png',
  '/img/Instagram.png',
  '/img/LinkedinLogo.png',
  '/img/light-mode.png',
  '/img/night.png',
  '/manifest.json'
];

// CDN resources to cache
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.0/jquery.min.js',
  'https://pro.fontawesome.com/releases/v5.10.0/css/all.css',
  'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache CDN assets
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching CDN assets');
        return Promise.allSettled(
          CDN_ASSETS.map(url => 
            cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err))
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Determine which cache to use
        const url = event.request.url;
        let cacheName = DYNAMIC_CACHE;
        
        if (STATIC_ASSETS.some(asset => url.includes(asset))) {
          cacheName = STATIC_CACHE;
        }

        // Cache the response
        caches.open(cacheName).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // If network fails, try to return a fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
        
        // For other resources, return a generic offline response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});

// Background sync for saving data when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(syncData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Timer notification',
    icon: '/img/favicon.png',
    badge: '/img/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/img/favicon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/img/favicon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Stopwatch Timer', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Utility function to sync data
async function syncData() {
  try {
    // Sync any pending data when back online
    const pendingData = await getStoredData('pending-sync');
    if (pendingData && pendingData.length > 0) {
      // Process pending sync data
      console.log('Service Worker: Syncing pending data');
      // Clear pending data after successful sync
      await clearStoredData('pending-sync');
    }
  } catch (error) {
    console.error('Service Worker: Sync failed:', error);
  }
}

// Utility functions for IndexedDB operations
function getStoredData(key) {
  return new Promise((resolve, reject) => {
    // Implement IndexedDB get operation
    resolve([]);
  });
}

function clearStoredData(key) {
  return new Promise((resolve, reject) => {
    // Implement IndexedDB clear operation
    resolve();
  });
}

// Update notification
self.addEventListener('message', (event) => {
  if (event.data.action === 'showUpdateNotification') {
    self.registration.showNotification('App Updated', {
      body: 'The app has been updated. Restart to get the latest features.',
      icon: '/img/favicon.png',
      tag: 'app-update',
      requireInteraction: true,
      actions: [
        { action: 'reload', title: 'Reload App' },
        { action: 'dismiss', title: 'Later' }
      ]
    });
  }
});
