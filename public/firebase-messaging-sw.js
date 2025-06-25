importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

// TODO: Replace with your own Firebase project config
firebase.initializeApp({
    apiKey: "AIzaSyDbDNEzFvnxNC_W874kbQGOcMfh0KYLCJU",
    authDomain: "micronaut-4d0bb.firebaseapp.com",
    projectId: "micronaut-4d0bb",
    storageBucket: "micronaut-4d0bb.firebasestorage.app",
    messagingSenderId: "608704731618",
    appId: "1:608704731618:web:11359e866eaf5f833b81bb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/placeholder-logo.png', // You can change this
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 