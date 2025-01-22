const CACHE_VERSION = 'attendance-app-v2'; // Increment this when you update your app

self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/app.js',
                '/icon512_rounded.png',
                '/icon512_maskable.png',
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_VERSION)
                    .map((cacheName) => {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
});


self.addEventListener('fetch', (event) => {
    // Serve cached assets if available
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('push', (event) => {
    // Extract custom message from the push payload if available
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'Time to mark your attendance!',
        icon: data.icon || 'icon512_rounded.png',
        badge: data.badge || 'icon512_rounded.png',
        vibrate: [200, 100, 200],
        actions: [
            { action: 'mark-attendance', title: 'Mark Now' },
            { action: 'snooze', title: 'Remind Me Later' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Attendance Reminder', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Handle custom actions
    if (event.action === 'mark-attendance') {
        clients.openWindow('/mark-attendance');
    } else if (event.action === 'snooze') {
        console.log('Snooze action clicked');
    } else {
        // Default action
        clients.openWindow('/');
    }
});
