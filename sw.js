const CACHE_NAME = 'hospital-listin-v19';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'icon.svg',
  'assets/MATERNO-2025.csv',
  // Cache external libraries essential for offline cold-start
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/react@18.2.0/jsx-runtime',
  'https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use {cache: 'reload'} to ensure we get fresh copies from network initially
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return fetch(url, { mode: 'cors', credentials: 'omit' }).then(response => {
            if (!response.ok) {
              throw new Error('Request for ' + url + ' failed with status ' + response.status);
            }
            return cache.put(url, response);
          }).catch(err => {
             console.error('Failed to cache ' + url, err);
             // Don't fail the whole installation if one external lib fails, 
             // but offline might be partial.
          });
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

self.addEventListener('fetch', (event) => {
  // Handle external requests vs local requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. Cache Hit - Return response
      if (response) {
        return response;
      }

      // 2. Clone the request for the fetch
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((networkResponse) => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200 || 
           (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        // 3. Cache the new response for future
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // If offline and not in cache, we can't do much for external scripts
        // But for navigation (html), we could return a fallback if we had one.
      });
    })
  );
});