import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

console.log('🔥 Initializing Firebase Vendor with keys:', {
    apiKey: firebaseConfig.apiKey ? 'PRESENT' : 'MISSING',
    projectId: firebaseConfig.projectId ? 'PRESENT' : 'MISSING'
});

// Initialize Firebase Lazy
let app: any;
let db: any;
let messaging: any;

try {
    if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        if (typeof window !== 'undefined') {
            messaging = getMessaging(app);
        }
    } else {
        console.error('❌ Firebase Config Missing Keys - Check .env');
    }
} catch (error) {
    console.error('❌ Firebase Init Error:', error);
}

export { db, messaging };

// Helper to get Token
export const requestFcmToken = async () => {
    if (!messaging) return null;
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });
            console.log('🔥 Vendor FCM Token:', token);
            return token;
        } else {
            console.log('🚫 Notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('❌ Error getting vendor token:', error);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });
