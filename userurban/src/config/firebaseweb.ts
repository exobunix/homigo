import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { Platform } from "react-native";

// Config loaded from .env
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const VAPID_KEY = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 IMPORTANT: Firebase Web Messaging only works on web platform
// On mobile (iOS/Android), use expo-notifications or react-native-firebase instead
let messaging: Messaging | null = null;

// Only initialize messaging on web platform
if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
        messaging = getMessaging(app);
        console.log('🔥 Firebase Web Messaging initialized');
    } catch (error) {
        console.log('⚠️ Firebase Messaging not available:', error);
    }
}

export const requestFcmToken = async () => {
    // Only works on web
    if (Platform.OS !== 'web' || !messaging) {
        console.log('📱 Skipping FCM token request (not web)');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });
            console.log('🔥 FCM Token:', token);
            return token;
        } else {
            console.log('🚫 Notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('❌ Error getting token:', error);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (Platform.OS !== 'web' || !messaging) return;
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export { db, messaging };

