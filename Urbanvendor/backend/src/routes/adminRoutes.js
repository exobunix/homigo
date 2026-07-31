const express = require('express');
const router = express.Router();
const {
    login,
    seedAdmin,
    getMe,
    getDashboardStats,
    getUsers,
    toggleUserBlock,
    getVendors,
    verifyVendor,
    toggleVendorBlock,
    getBookings,
    getServices,
    createService,
    updateService,
    deleteService,
    updateProfile,
    uploadProfilePhoto,
    changePassword,
    registerAdmin,
    getPendingAdmins,
    getActiveAdmins,
    approveAdmin,
    deleteAdmin,
    updateAdmin
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminAuth');

// Auth routes
router.post('/login', login);
router.post('/register', registerAdmin);
router.post('/seed', seedAdmin);
router.get('/me', protectAdmin, getMe);

// Profile management
router.put('/profile', protectAdmin, updateProfile);
router.post('/profile/photo', protectAdmin, uploadProfilePhoto);
router.put('/password', protectAdmin, changePassword);

// Admin Management (Master Admin)
// Route used by Admin Panel: /api/admin/admins/pending
router.get('/admins/pending', protectAdmin, getPendingAdmins);
router.get('/admins/active', protectAdmin, getActiveAdmins);
router.put('/admins/:id/approve', protectAdmin, approveAdmin);
router.put('/admins/:id', protectAdmin, updateAdmin);
router.delete('/admins/:id', protectAdmin, deleteAdmin);

// Dashboard
router.get('/dashboard/stats', protectAdmin, getDashboardStats);

// Users management
router.get('/users', protectAdmin, getUsers);
router.put('/users/:id/block', protectAdmin, toggleUserBlock);

// Vendors management
router.get('/vendors', protectAdmin, getVendors);
router.put('/vendors/:id/verify', protectAdmin, verifyVendor);
router.put('/vendors/:id/block', protectAdmin, toggleVendorBlock);

// Bookings management
router.get('/bookings', protectAdmin, getBookings);

// Services management
router.get('/services', protectAdmin, getServices);
router.post('/services', protectAdmin, createService);
router.put('/services/:id', protectAdmin, updateService);
router.delete('/services/:id', protectAdmin, deleteService);

module.exports = router;
