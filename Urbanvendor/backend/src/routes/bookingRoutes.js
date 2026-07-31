const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// All booking routes require authentication
router.use(auth);

// Shared Routes
router.get('/active', bookingController.getActiveBookings);
router.get('/completed', bookingController.getCompletedBookings);
router.get('/:id', bookingController.getBookingById);

// User Routes
router.post('/', bookingController.createBooking);
router.get('/user/:userId', bookingController.getUserBookings);
router.post('/:id/cancel', bookingController.cancelBookingByUser);

// Vendor Routes
router.post('/:id/accept', bookingController.acceptBooking);
router.post('/:id/reject', bookingController.rejectBooking);
router.patch('/:id/status', bookingController.updateBookingStatus);
router.post('/:id/additional-charges', bookingController.addAdditionalCharges);
router.post('/:id/work-images', bookingController.uploadWorkImages);
router.post('/:id/signature', bookingController.addCustomerSignature);

// Smart Booking Routes
router.post('/:id/vendor-response', bookingController.vendorResponse);
router.post('/:id/user-approval', bookingController.userApproval);

// OTP Verification Routes
router.get('/:id/otp', bookingController.getBookingOtp);           // User gets OTP
router.post('/:id/verify-otp', bookingController.verifyCompletionOtp); // Vendor verifies OTP

module.exports = router;
