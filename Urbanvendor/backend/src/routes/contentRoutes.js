const express = require('express');
const router = express.Router();
const {
    // Categories
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    // Addons
    getAddons,
    createAddon,
    updateAddon,
    deleteAddon,
    // Time Slots
    getTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    // Banners
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    // Cities
    getCities,
    createCity,
    updateCity,
    deleteCity,
    // Payouts
    getPayouts,
    createPayout,
    updatePayout,
    // Notifications
    getNotifications,
    createNotification,
    deleteNotification,
    // Testimonials
    getTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    // Country Codes
    getCountryCodes,
    createCountryCode,
    updateCountryCode,
    deleteCountryCode,
    getWebContent,
    updateWebContent
} = require('../controllers/contentController');
const { protectAdmin } = require('../middleware/adminAuth');

// Category routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', protectAdmin, createCategory);
router.put('/categories/:id', protectAdmin, updateCategory);
router.delete('/categories/:id', protectAdmin, deleteCategory);

// Addon routes
router.get('/addons', getAddons);
router.post('/addons', protectAdmin, createAddon);
router.put('/addons/:id', protectAdmin, updateAddon);
router.delete('/addons/:id', protectAdmin, deleteAddon);

// Time Slot routes
router.get('/timeslots', getTimeSlots);
router.post('/timeslots', protectAdmin, createTimeSlot);
router.put('/timeslots/:id', protectAdmin, updateTimeSlot);
router.delete('/timeslots/:id', protectAdmin, deleteTimeSlot);

// Banner routes
router.get('/banners', getBanners);
router.post('/banners', protectAdmin, createBanner);
router.put('/banners/:id', protectAdmin, updateBanner);
router.delete('/banners/:id', protectAdmin, deleteBanner);

// City routes
router.get('/cities', getCities);
router.post('/cities', protectAdmin, createCity);
router.put('/cities/:id', protectAdmin, updateCity);
router.delete('/cities/:id', protectAdmin, deleteCity);

// Payout routes
router.get('/payouts', protectAdmin, getPayouts);
router.post('/payouts', protectAdmin, createPayout);
router.put('/payouts/:id', protectAdmin, updatePayout);

// Notification routes
router.get('/notifications', protectAdmin, getNotifications);
router.post('/notifications', protectAdmin, createNotification);
router.delete('/notifications/:id', protectAdmin, deleteNotification);

// Testimonial routes
router.get('/testimonials', getTestimonials);
router.post('/testimonials', protectAdmin, createTestimonial);
router.put('/testimonials/:id', protectAdmin, updateTestimonial);
router.delete('/testimonials/:id', protectAdmin, deleteTestimonial);

// Country Code routes
router.get('/country-codes', getCountryCodes);
router.post('/country-codes', protectAdmin, createCountryCode);
router.put('/country-codes/:id', protectAdmin, updateCountryCode);
router.delete('/country-codes/:id', protectAdmin, deleteCountryCode);

// Web Content routes
router.get('/web-content', getWebContent);
router.put('/web-content', protectAdmin, updateWebContent);

module.exports = router;
