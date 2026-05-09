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
  } else if (event.data && event.data.type === 'CANCEL_SOS_ALERT') {
    const tagToCancel = event.data.tag;
    console.log(`[SW] Attempting to cancel notification with tag: ${tagToCancel}`);
    self.registration.getNotifications({ tag: tagToCancel }).then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
        console.log(`[SW] Notification closed for tag: ${tagToCancel}`);
      });
    });
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  const sosId = event.notification.tag; // We pass the sosAlert.id as the tag
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Find an open client window
      let client = clientList.find(c => c.visibilityState === 'visible') || clientList[0];
      
      if (client) {
        // Send message to the client
        client.postMessage({ type: 'SOS_ACKNOWLEDGED', sosId });
        return client.focus();
      }
      
      // If no window is open, open one
      return self.clients.openWindow('/?sos_ack=' + sosId);
    })
  );
});
