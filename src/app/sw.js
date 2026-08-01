import { defaultCache } from "@serwist/next/worker";
import { Serwist, BackgroundSyncPlugin } from "serwist";

const bgSyncPlugin = new BackgroundSyncPlugin("servify-offline-queue", {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
});

const customCache = [
  // 1. Background Sync for offline mutations (POST, PATCH, PUT, DELETE)
  {
    matcher: ({ url, request }) => url.pathname.startsWith('/api/') && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method),
    handler: "NetworkOnly",
    options: {
      plugins: [bgSyncPlugin],
    },
  },
  // 2. Cache API GET requests for offline viewing (Profiles, Bookings, etc.)
  {
    matcher: ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'GET',
    handler: "NetworkFirst",
    options: {
      cacheName: "servify-api-cache",
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
    },
  },
  // 3. Default Serwist cache for Next.js assets, pages, images
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customCache,
});

serwist.addEventListeners();

// Listen for push notifications from the server
self.addEventListener("push", (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || "/favicon.png",
        badge: "/favicon.png",
        data: { url: data.url || "/" },
        vibrate: [200, 100, 200],
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (e) {
      console.error("Push data parse error:", e);
      event.waitUntil(
        self.registration.showNotification("Servify", {
          body: event.data.text(),
          icon: "/favicon.png",
        })
      );
    }
  }
});

// Handle click on the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // If not, check if any client is open and navigate there, or open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
