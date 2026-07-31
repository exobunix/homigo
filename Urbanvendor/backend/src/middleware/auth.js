const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    // Try finding vendor first
    let user = await Vendor.findById(payload.id);
    let role = 'vendor';

    // If not vendor, try finding user
    if (!user) {
      user = await User.findById(payload.id);
      role = 'user';
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.role = role; // Attach role to request for later use if needed
    next();
  } catch (err) {
    console.error('Auth error', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
