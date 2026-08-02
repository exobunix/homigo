const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Vendor = require('../models/Vendor');
const imagekit = require('../config/imagekit');

function uploadBufferToImageKit(buffer, folder) {
  return new Promise((resolve, reject) => {
    const fileName = `file_${Date.now()}_${Math.round(Math.random() * 1e9)}.jpg`;
    imagekit.upload({
      file: buffer,
      fileName: fileName,
      folder: folder || '/'
    }, function(error, result) {
      if (error) {
        return reject(error);
      }
      resolve({ url: result.url });
    });
  });
}


function signToken(vendor) {
  const payload = { id: vendor._id };
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

exports.sendOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone is required' });
  }

  // For development we do not actually send an SMS
  const otp = process.env.OTP_STATIC || '123456';

  console.log(`DEV OTP for ${phone}: ${otp}`);

  return res.json({
    success: true,
    data: null,
    message: 'OTP sent (development mode)',
  });
};

exports.verifyOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone is required' });
  }

  // At this point, the client should have already verified the OTP with Firebase.
  // Here we just create/find the vendor for this phone and issue our own JWT.

  let vendor = await Vendor.findOne({ phone });

  if (!vendor) {
    vendor = await Vendor.create({ phone });
  }

  const token = signToken(vendor);

  return res.json({
    success: true,
    data: { token, user: vendor },
    message: 'Phone verified',
  });
};

// Firebase Authentication - Supports both Customer and Vendor apps
exports.firebaseAuth = async (req, res) => {
  try {
    const { idToken, phone, userType } = req.body;

    if (!idToken || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token and phone are required'
      });
    }

    // Verify Firebase ID token
    const { auth } = require('../config/firebase');
    const decodedToken = await auth.verifyIdToken(idToken);

    // Verify phone number matches (Firebase returns E.164 format e.g. +919999999999)
    if (decodedToken.phone_number !== phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number mismatch'
      });
    }

    // Normalize phone number for DB lookup (remove +91 prefix if present AND all spaces)
    // This ensures we match existing users who have 10-digit numbers in DB
    const dbPhone = phone.replace(/^\+91/, '').replace(/\s/g, '');

    console.log('🔍 Auth Debug:', {
      receivedPhone: phone,
      normalizedPhone: dbPhone,
      userType
    });

    let user;
    let token;

    // Handle based on user type
    if (userType === 'customer') {
      // Customer login - use User model
      const User = require('../models/User');
      user = await User.findOne({ phone: dbPhone });
      console.log('👤 User Lookup 1 (dbPhone):', user ? 'Found' : 'Not Found');

      if (!user) {
        // Try finding with full phone just in case
        user = await User.findOne({ phone });
        console.log('👤 User Lookup 2 (phone):', user ? 'Found' : 'Not Found');
      }

      if (!user) {
        console.log('⚠️ Creating NEW User with phone:', dbPhone);
        user = await User.create({
          phone: dbPhone, // Store normalized phone
          firebaseUid: decodedToken.uid
        });
      } else if (!user.firebaseUid) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }
    } else {
      // Vendor login (default) - use Vendor model
      user = await Vendor.findOne({ phone: dbPhone });
      console.log('🏪 Vendor Lookup 1 (dbPhone):', user ? 'Found' : 'Not Found');

      if (!user) {
        // Try finding with full phone just in case
        user = await Vendor.findOne({ phone });
        console.log('🏪 Vendor Lookup 2 (phone):', user ? 'Found' : 'Not Found');
      }

      if (!user) {
        console.log('⚠️ Creating NEW Vendor with phone:', dbPhone);
        user = await Vendor.create({
          phone: dbPhone, // Store normalized phone
          firebaseUid: decodedToken.uid
        });
      } else if (!user.firebaseUid) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }
    }

    // Issue JWT token
    token = signToken(user);

    return res.json({
      success: true,
      data: { token, user },
      message: 'Firebase authentication successful',
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Firebase authentication failed',
      error: error.message
    });
  }
};

exports.loginWithPassword = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password are required' });
  }

  const vendor = await Vendor.findOne({ phone });

  if (!vendor || !vendor.passwordHash) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, vendor.passwordHash);

  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signToken(vendor);

  return res.json({
    success: true,
    data: { token, user: vendor },
    message: 'Login successful',
  });
};

exports.getProfile = async (req, res) => {
  return res.json({ success: true, data: req.user, message: 'Profile loaded' });
};

exports.updateProfile = async (req, res) => {
  const { password, ...rest } = req.body;

  const updates = { ...rest };

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updates.passwordHash = await bcrypt.hash(password, salt);
  }

  const vendor = await Vendor.findByIdAndUpdate(req.user._id, updates, {
    new: true,
  });

  return res.json({ success: true, data: vendor, message: 'Profile updated' });
};

exports.updateOnlineStatus = async (req, res) => {
  const { isOnline } = req.body;

  const vendor = await Vendor.findByIdAndUpdate(
    req.user._id,
    { isOnline: !!isOnline },
    { new: true }
  );

  return res.json({ success: true, data: vendor, message: 'Online status updated' });
};

exports.updateBankDetails = async (req, res) => {
  const bankDetails = req.body;

  const vendor = await Vendor.findByIdAndUpdate(
    req.user._id,
    { bankDetails: { ...bankDetails, isVerified: true } },
    { new: true }
  );

  return res.json({ success: true, data: vendor, message: 'Bank details updated' });
};

exports.updateServices = async (req, res) => {
  const { services } = req.body;

  const vendor = await Vendor.findByIdAndUpdate(
    req.user._id,
    { services: services || [] },
    { new: true }
  );

  return res.json({ success: true, data: vendor, message: 'Services updated' });
};

exports.updateWorkingHours = async (req, res) => {
  const workingHours = req.body;

  const vendor = await Vendor.findByIdAndUpdate(
    req.user._id,
    { workingHours },
    { new: true }
  );

  return res.json({ success: true, data: vendor, message: 'Working hours updated' });
};

exports.updateNotifications = async (req, res) => {
  const { enabled } = req.body;
  const vendor = await Vendor.findByIdAndUpdate(
    req.user._id,
    { notificationsEnabled: !!enabled },
    { new: true }
  );
  return res.json({ success: true, data: vendor, message: 'Notifications preference updated' });
};

exports.updateServiceArea = async (req, res) => {
  const { workingRadius, location } = req.body;
  const updates = {};
  if (typeof workingRadius === 'number') {
    updates.workingRadius = workingRadius;
  }
  if (location && typeof location === 'object') {
    updates.location = location;
  }
  const vendor = await Vendor.findByIdAndUpdate(req.user._id, updates, { new: true });
  return res.json({ success: true, data: vendor, message: 'Service area updated' });
};

exports.uploadProfileImage = async (req, res) => {
  console.log('uploadProfileImage route hit, user =', req.user && req.user._id, 'file =',
    req.file ? { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } : null
  );
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  try {
    const result = await uploadBufferToImageKit(req.file.buffer, 'vendors/profile');

    const vendor = await Vendor.findByIdAndUpdate(
      req.user._id,
      { profileImage: result.url },
      { new: true }
    );

    return res.json({ success: true, data: vendor, message: 'Profile image updated' });
  } catch (err) {
    console.error('ImageKit upload error for profile image:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};

exports.uploadKYC = async (req, res) => {
  const { aadharNumber, panNumber } = req.body;
  const files = req.files || {};

  try {
    const vendor = await Vendor.findById(req.user._id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const kyc = vendor.kyc || {};

    if (typeof aadharNumber === 'string') {
      kyc.aadharNumber = aadharNumber;
    }

    if (typeof panNumber === 'string') {
      kyc.panNumber = panNumber;
    }

    if (files.aadharFront && files.aadharFront[0]) {
      const upload = await uploadBufferToImageKit(files.aadharFront[0].buffer, 'vendors/kyc');
      kyc.aadharFront = upload.url;
    }

    if (files.aadharBack && files.aadharBack[0]) {
      const upload = await uploadBufferToImageKit(files.aadharBack[0].buffer, 'vendors/kyc');
      kyc.aadharBack = upload.url;
    }

    if (files.panImage && files.panImage[0]) {
      const upload = await uploadBufferToImageKit(files.panImage[0].buffer, 'vendors/kyc');
      kyc.panImage = upload.url;
    }

    let certificates = Array.isArray(kyc.certificates) ? kyc.certificates : [];

    if (files.certificates) {
      for (const file of files.certificates) {
        const upload = await uploadBufferToImageKit(file.buffer, 'vendors/certificates');
        certificates.push(upload.url);
      }
    }

    kyc.certificates = certificates;

    const isVerified = !!kyc.aadharNumber && !!kyc.panNumber;
    kyc.isVerified = isVerified;
    if (isVerified && !kyc.verificationDate) {
      kyc.verificationDate = new Date();
    }

    vendor.kyc = kyc;
    const updatedVendor = await vendor.save();

    return res.json({ success: true, data: updatedVendor, message: 'KYC updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'KYC upload failed' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
  }

  try {
    const vendor = await Vendor.findById(req.user._id);

    if (!vendor || !vendor.passwordHash) {
      return res.status(400).json({ success: false, message: 'No existing password to change' });
    }

    const isMatch = await bcrypt.compare(currentPassword, vendor.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    vendor.passwordHash = await bcrypt.hash(newPassword, salt);
    const updatedVendor = await vendor.save();

    return res.json({ success: true, data: updatedVendor, message: 'Password updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const result = await uploadBufferToImageKit(req.file.buffer, 'urbanvendor/services');

    res.json({
      success: true,
      data: {
        url: result.url
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

exports.logout = async (_req, res) => {
  // On mobile we usually just drop the token; nothing to do server-side
  return res.json({ success: true, data: null, message: 'Logged out' });
};
