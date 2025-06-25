// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBhGwdqw9i_O5SjRJEZXA6Nc3ho5MGpDDs",
  authDomain: "blaz-43c61.firebaseapp.com",
  databaseURL: "https://blaz-43c61-default-rtdb.firebaseio.com",
  projectId: "blaz-43c61",
  storageBucket: "blaz-43c61.appspot.com",
  messagingSenderId: "9929303497",
  appId: "1:9929303497:web:6f32f68135acda6e807418",
  measurementId: "G-RH8JTLJ59E",
});

const messaging = firebase.messaging();

// ✅ Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const { title, body } = payload.notification;
  const options = {
    body,
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(title, options);
});

// ✅ Add this to allow fetch handling (required for some FCM APIs and PWA installability)
self.addEventListener("fetch", function (event) {
  // noop fetch handler to make service worker "active" and keep alive
});
