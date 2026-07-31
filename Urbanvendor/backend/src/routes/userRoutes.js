const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/login', userController.loginOrRegister);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/profile/image', authMiddleware, upload.single('image'), userController.uploadProfileImage);
router.post('/address', authMiddleware, userController.addAddress);

module.exports = router;
