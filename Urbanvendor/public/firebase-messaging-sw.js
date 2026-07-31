// Firebase Messaging Service Worker - Vendor App
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBy2HN5WuKotc6VkNuT1gepHGStYgbL0V8",
    authDomain: "urbanprox-7aa0d.firebaseapp.com",
    projectId: "urbanprox-7aa0d",
    storageBucket: "urbanprox-7aa0d.firebasestorage.app",
    messagingSenderId: "1032278721160",
    appId: "1:1032278721160:web:f3554ef71641e7daca153d"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('🔔 Vendor Background Message:', payload);

    const notificationTitle = payload.notification?.title || 'New Booking Request!';
    const notificationOptions = {
        body: payload.notification?.body || 'Check your dashboard',
        icon: '/assets/icon.png',
        badge: '/assets/icon.png',
        vibrate: [300, 100, 300, 100, 300],
        tag: 'vendor-booking-notification',
        requireInteraction: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
