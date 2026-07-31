const PaymentGateway = require('../models/PaymentGateway');

exports.getPaymentGateways = async (req, res) => {
    try {
        const gateways = await PaymentGateway.find();
        // Mask secret keys for security
        const maskedGateways = gateways.map(g => ({
            ...g.toObject(),
            secretKey: g.secretKey ? '••••••••' : ''
        }));
        res.json({ success: true, data: maskedGateways });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updatePaymentGateway = async (req, res) => {
    try {
        const { name, publicKey, secretKey, mode, isActive } = req.body;

        let gateway = await PaymentGateway.findOne({ name });

        if (gateway) {
            gateway.publicKey = publicKey;
            // Only update secret key if provided (not masked)
            if (secretKey && !secretKey.includes('••••')) {
                gateway.secretKey = secretKey;
            }
            gateway.mode = mode;
            gateway.isActive = isActive;
            await gateway.save();
        } else {
            gateway = new PaymentGateway({
                name,
                publicKey,
                secretKey,
                mode,
                isActive
            });
            await gateway.save();
        }

        res.json({ success: true, message: 'Payment gateway updated successfully', data: gateway });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
