const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

try {
    // 1. Try Environment Variable (Render/Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Handle if it's base64 encoded or raw JSON string
        const parsable = process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')
            ? process.env.FIREBASE_SERVICE_ACCOUNT
            : Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8');
        serviceAccount = JSON.parse(parsable);
        console.log('✅ Loaded Firebase credentials from Environment Variable');
    }
    // 2. Try Local File (Development)
    else {
        const serviceAccountPath = path.join(__dirname, '../../service-account.json');
        serviceAccount = require(serviceAccountPath);
        console.log('✅ Loaded Firebase credentials from Local File');
    }

    // Initialize
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    console.log('🔥 Firebase Admin Initialized Successfully');

} catch (error) {
    console.error('⚠️ Firebase Init Warning:', error.message);
    console.error('   -> Notifications will not work until FIREBASE_SERVICE_ACCOUNT env var is set.');
}

// Export safe instances (mock if failed to prevent crash)
const db = admin.apps.length ? admin.firestore() : { collection: () => ({ doc: () => ({ set: () => console.log('Mock DB Write') }) }) };
// If using a custom database name:
if (admin.apps.length) {
    try { db.settings({ databaseId: 'default' }); } catch (e) { }
}

const messager = admin.apps.length ? admin.messaging() : { send: () => console.log('Mock Notification Sent') };

module.exports = { admin, db, messager };
