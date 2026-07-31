const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const auth = require('../middleware/auth');

router.get('/', vendorController.getVendors);
router.get('/available', auth, vendorController.getAvailableVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/availability', vendorController.checkVendorAvailability);
router.patch('/:id/status', auth, vendorController.updateStatus);

module.exports = router;
