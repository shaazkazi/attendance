const CACHE_VERSION = 'attendance-app-v3';
const CACHE_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/icon512_rounded.png',
    '/icon512_maskable.png',
    '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            return cache.addAll(CACHE_FILES);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_VERSION)
                    .map((cacheName) => caches.delete(cacheName))
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_VERSION)
                    .then(cache => cache.put(event.request, responseClone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Push event - handle notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Time to mark your attendance!',
        icon: 'icon512_rounded.png',
        badge: 'icon512_rounded.png',
        vibrate: [200, 100, 200],
        tag: 'attendance-reminder',
        renotify: true,
        actions: [
            { action: 'dismiss', title: 'Dismiss' },
            { action: 'check', title: 'Check Now' }
        ],
        data: {
            timestamp: Date.now(),
            url: self.location.origin
        }
    };

    event.waitUntil(
        self.registration.showNotification('Attendance Reminder', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                if (windowClients.length > 0) {
                    return windowClients[0].focus();
                }
                return clients.openWindow(event.notification.data.url || '/');
            })
    );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
    console.log('Notification was closed', event);
});