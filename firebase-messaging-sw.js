/* NexLink Firebase Cloud Messaging service worker */
importScripts("https://www.gstatic.com/firebasejs/11.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCjadRD1TAix0IsjaxYI-76P9mDpKmQ34Q",
  authDomain: "quickchat-f5012.firebaseapp.com",
  databaseURL: "https://quickchat-f5012-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quickchat-f5012",
  storageBucket: "quickchat-f5012.firebasestorage.app",
  messagingSenderId: "80730246249",
  appId: "1:80730246249:web:b3b444c63aca7a5c7466f8",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "NexLink";
  const body = payload?.notification?.body || "Новое уведомление";
  const chatId = payload?.data?.chatId || "nexlink";
  self.registration.showNotification(title, {
    body,
    icon: "./favicon.svg",
    badge: "./favicon.svg",
    tag: `nexlink-${chatId}`,
    data: payload?.data || {},
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const chatId = event.notification?.data?.chatId;
  const target = chatId ? `./?chat=${encodeURIComponent(chatId)}` : "./";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const client of list) {
      if ("focus" in client) {
        try { if (chatId) client.postMessage({ type: "nexlink-open-chat", chatId }); } catch {}
        return client.focus();
      }
    }
    return clients.openWindow(target);
  }));
});
