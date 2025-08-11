const CACHE_NAME = 'choreme-v1.0.0';
const API_CACHE_NAME = 'choreme-api-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/v1/assignments',
  '/api/v1/chores',
  '/api/v1/rewards',
  '/api/v1/ledger',
  '/api/v1/users/me'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else {
    // Handle static assets
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // Try network first for HTML requests
    if (request.destination === 'document') {
      try {
        const networkResponse = await fetch(request);
        return networkResponse;
      } catch (error) {
        // Fallback to cache if network fails
        const cachedResponse = await caches.match(request);
        return cachedResponse || caches.match('/');
      }
    }
    
    // For other assets, try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Fetch failed', error);
    
    // Return cached version or offline page
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Handle API requests with cache-first strategy for GET requests
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Only cache GET requests
  if (request.method !== 'GET') {
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Network error' }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: API request failed, trying cache', error);
    
    // Fallback to cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add a header to indicate this is from cache
      const response = cachedResponse.clone();
      response.headers.set('X-Cache', 'SW');
      return response;
    }
    
    // Return error response
    return new Response(
      JSON.stringify({ success: false, error: 'Offline - no cached data available' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'chore-completion') {
    event.waitUntil(syncChoreCompletions());
  } else if (event.tag === 'progress-update') {
    event.waitUntil(syncProgressUpdates());
  }
});

// Sync offline chore completions
async function syncChoreCompletions() {
  try {
    // Get pending completions from IndexedDB
    const pendingCompletions = await getFromIndexedDB('pendingCompletions');
    
    for (const completion of pendingCompletions) {
      try {
        const response = await fetch(`/api/v1/assignments/${completion.id}/complete`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${completion.token}`
          },
          body: JSON.stringify(completion.data)
        });
        
        if (response.ok) {
          // Remove from pending list
          await removeFromIndexedDB('pendingCompletions', completion.id);
        }
      } catch (error) {
        console.log('Failed to sync completion:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Sync offline progress updates
async function syncProgressUpdates() {
  try {
    const pendingUpdates = await getFromIndexedDB('pendingUpdates');
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch(`/api/v1/assignments/${update.id}/progress`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${update.token}`
          },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          await removeFromIndexedDB('pendingUpdates', update.id);
        }
      } catch (error) {
        console.log('Failed to sync progress:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// IndexedDB helpers (simplified - would need full implementation)
async function getFromIndexedDB(storeName) {
  // Implementation would use IndexedDB to store offline data
  return [];
}

async function removeFromIndexedDB(storeName, id) {
  // Implementation would remove item from IndexedDB
  return true;
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    data: data.url ? { url: data.url } : undefined,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-dismiss.png'
      }
    ],
    requireInteraction: true,
    tag: data.tag || 'default'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' && event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else if (event.action !== 'dismiss') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});