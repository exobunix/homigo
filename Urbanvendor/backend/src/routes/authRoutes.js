const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public auth endpoints
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/firebase-auth', authController.firebaseAuth); // Firebase OTP authentication
router.post('/login', authController.loginWithPassword);

// Protected endpoints
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post(
  '/profile-image',
  authMiddleware,
  upload.single('image'),
  authController.uploadProfileImage
);
router.post(
  '/upload-image',
  authMiddleware,
  upload.single('image'),
  authController.uploadImage
);
router.patch('/online-status', authMiddleware, authController.updateOnlineStatus);
router.put('/bank-details', authMiddleware, authController.updateBankDetails);
router.put('/services', authMiddleware, authController.updateServices);
router.put('/working-hours', authMiddleware, authController.updateWorkingHours);
router.patch('/notifications', authMiddleware, authController.updateNotifications);
router.put('/service-area', authMiddleware, authController.updateServiceArea);
router.post(
  '/kyc',
  authMiddleware,
  upload.fields([
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 },
    { name: 'panImage', maxCount: 1 },
    { name: 'certificates', maxCount: 10 },
  ]),
  authController.uploadKYC
);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
