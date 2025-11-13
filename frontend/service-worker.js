const CACHE_NAME = 'spotify-clone-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/app/app.js',
  '/app/services/AuthService.js',
  '/app/services/SongService.js',
  '/app/services/PlaylistService.js',
  '/app/services/PlayerService.js',
  '/app/services/SocketService.js',
  '/app/controllers/MainController.js',
  '/app/controllers/AuthController.js',
  '/app/controllers/HomeController.js',
  '/app/controllers/SearchController.js',
  '/app/controllers/LibraryController.js',
  '/app/controllers/UploadController.js',
  '/app/controllers/PlayerController.js',
  '/app/controllers/PlaylistController.js',
  '/app/views/auth.html',
  '/app/views/home.html',
  '/app/views/search.html',
  '/app/views/library.html',
  '/app/views/upload.html',
  '/app/views/playlist.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
