// Simple SOS notification service worker
// This handles showing notifications on Android and other mobile devices

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Listen for push-like messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SOS_ALERT') {
    const { title, body, tag } = event.data;
    
    self.registration.showNotification(title, {
      body: body,
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [300, 100, 300, 100, 300],
      tag: tag || 'sos-alert',
      renotify: true,
      requireInteraction: true,
      actions: [
        { action: 'acknowledge', title: 'Acknowledge' }
      ]
    });
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
