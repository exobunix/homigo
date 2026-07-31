const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminAuth');
const { getPaymentGateways, updatePaymentGateway } = require('../controllers/settingsController');

router.get('/payment-gateways', protectAdmin, getPaymentGateways);
router.put('/payment-gateways', protectAdmin, updatePaymentGateway);

module.exports = router;
