const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * Adds decoded token to req.firebaseUser
 */
const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify the Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);

        // Add decoded token to request
        req.firebaseUser = decodedToken;
        req.firebaseUid = decodedToken.uid;
        req.phoneNumber = decodedToken.phone_number;

        next();
    } catch (error) {
        console.error('Firebase token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

module.exports = verifyFirebaseToken;
