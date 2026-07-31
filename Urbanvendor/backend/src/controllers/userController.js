const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', {
        expiresIn: '30d',
    });
};

// Login or Register with Phone
exports.loginOrRegister = async (req, res) => {
    const { phone, location, name } = req.body;

    // Normalize phone number (remove +91 and spaces)
    const dbPhone = phone.replace(/^\+91/, '').replace(/\s/g, '');

    try {
        let user = await User.findOne({ phone: dbPhone });

        if (!user) {
            // Try finding with full phone just in case
            user = await User.findOne({ phone });
        }

        if (!user) {
            // Register new user
            // If location is provided during registration, save it as the first address or a default location field
            // For now, we'll just create the user. You can expand this to save the initial location if needed.
            user = await User.create({ phone: dbPhone, name: name || 'New User' });

            if (location) {
                // Optionally save the initial location as a saved address
                user.savedAddresses.push({
                    label: 'Current Location',
                    addressLine1: location.address || 'Unknown',
                    city: location.city || 'Unknown',
                    pincode: location.pincode || '000000',
                    latitude: location.latitude,
                    longitude: location.longitude,
                    isDefault: true
                });
                await user.save();
            }
        } else if (name && !user.name) {
            // Update name if it exists in request but not in DB
            user.name = name;
            await user.save();
        }

        // In a real app, you would send an OTP here.
        // For this demo, we'll just return the user and token immediately.

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user,
            message: 'Login successful'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store'); // Prevent 304 Not Modified
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        res.json({ success: true, data: user, message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add Address
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // If set as default, unset other defaults
        if (req.body.isDefault) {
            user.savedAddresses.forEach(addr => addr.isDefault = false);
        }

        user.savedAddresses.push(req.body);
        await user.save();

        res.json({ success: true, data: user.savedAddresses, message: 'Address added' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const cloudinary = require('../config/cloudinary');

function uploadBufferToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });

        stream.end(buffer);
    });
}

// Upload Profile Image
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const result = await uploadBufferToCloudinary(req.file.buffer, 'users/profile');

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profileImage: result.secure_url },
            { new: true }
        );

        res.json({ success: true, data: user, message: 'Profile image updated' });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
};
