const CACHE_NAME = 'canti-natale-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './Spartiti Canti di Natale.pdf',
  'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&family=Poppins:wght@300;400;600&display=swap'
];

// Install Event - Combines caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event - Serve from cache, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
            // For external resources (like fonts), type might be 'cors' which is fine
            if(response.type !== 'cors') return response;
        }

        // Clone the response because it's a stream and can only be consumed once
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Verify scheme is http or https before putting in cache (skips chrome-extension:// etc)
          if (event.request.url.startsWith('http')) {
             cache.put(event.request, responseToCache);
          }
        });

        return response;
      });
    })
  );
});
