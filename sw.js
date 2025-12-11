const CACHE_NAME = 'hospital-listin-v2';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'icon.svg',
  'assets/MATERNO-2025.csv'
];

// 1. Instalar el Service Worker y guardar los archivos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Abriendo caché y guardando archivos...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activar y limpiar cachés antiguas si actualizamos la versión
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Interceptar las peticiones (Modo Offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en caché, lo devolvemos (funciona offline)
      if (response) {
        return response;
      }

      // Si no, lo pedimos a internet y lo guardamos para la próxima (para las librerías CDN)
      return fetch(event.request).then((networkResponse) => {
        // Solo cacheamos peticiones válidas (http/https) y exitosas
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Si falla internet y no está en caché, no podemos hacer mucho más por ahora
      });
    })
  );
});