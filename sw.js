const CACHE_NAME = 'hospital-listin-v22';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'icon.svg',
  'assets/MATERNO-2025.csv',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/react@18.2.0/jsx-runtime',
  'https://esm.sh/lucide-react@0.344.0?deps=react@18.2.0'
];

self.addEventListener('install', (event) => {
  // Note: We removed self.skipWaiting() to allow the user to control the update via UI
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return fetch(url, { mode: 'cors', credentials: 'omit' }).then(response => {
            if (!response.ok) {
              throw new Error('Request for ' + url + ' failed with status ' + response.status);
            }
            return cache.put(url, response);
          }).catch(err => {
             console.error('Failed to cache ' + url, err);
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || 
           (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {});
    })
  );
});