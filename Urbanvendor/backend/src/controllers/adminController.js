const Admin = require('../models/Admin');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Addon = require('../models/Addon');
const TimeSlot = require('../models/TimeSlot');
const Banner = require('../models/Banner');
const City = require('../models/City');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Auto-create Master Admin if using default credentials
        if (email === 'masteradmin@urban.com' && password === 'masteradmin12345') {
            let master = await Admin.findOne({ email });
            if (!master) {
                master = new Admin({
                    name: 'Master Admin',
                    email,
                    role: 'super_admin',
                    isVerified: true
                });
                await master.setPassword(password);
                await master.save();
            }
        }

        // Check for admin
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.checkPassword(password))) {
            // Check verification unless master admin
            if (admin.email !== 'masteradmin@urban.com' && !admin.isVerified) {
                return res.status(403).json({ success: false, message: 'Account pending approval by Master Admin' });
            }

            res.json({
                success: true,
                data: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    token: generateToken(admin._id)
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create initial admin (Seed)
// @route   POST /api/admin/seed
// @access  Public
exports.seedAdmin = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ success: false, message: 'Admin already exists' });
        }

        const admin = new Admin({
            email,
            name,
            role: 'super_admin',
            isVerified: true
        });

        await admin.setPassword(password);
        await admin.save();

        res.status(201).json({
            success: true,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id)
            }
        });
    } catch (error) {
        console.error('Seed admin error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get Admin Profile
// @route   GET /api/admin/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-passwordHash');
        res.json({ success: true, data: admin });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get Dashboard Stats
// @route   GET /api/admin/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        // Basic counts
        const totalUsers = await User.countDocuments();
        const totalVendors = await Vendor.countDocuments();
        const activeVendors = await Vendor.countDocuments({ isVerified: true, isBlocked: false });
        const verifiedVendors = await Vendor.countDocuments({ isVerified: true });
        const pendingVendors = await Vendor.countDocuments({ isVerified: false });
        const blockedVendors = await Vendor.countDocuments({ isBlocked: true });

        const totalBookings = await Booking.countDocuments();
        const totalServices = await Service.countDocuments();

        // Content management counts
        const totalCategories = await Category.countDocuments();
        const mainCategories = await Category.countDocuments({ level: 'main' });
        const subCategories = await Category.countDocuments({ level: 'sub' });
        const childCategories = await Category.countDocuments({ level: 'child' });
        const totalAddons = await Addon.countDocuments();
        const activeAddons = await Addon.countDocuments({ isActive: true });
        const totalTimeSlots = await TimeSlot.countDocuments();
        const activeTimeSlots = await TimeSlot.countDocuments({ isActive: true });
        const totalBanners = await Banner.countDocuments();
        const activeBanners = await Banner.countDocuments({ isActive: true });
        const totalCities = await City.countDocuments();
        const activeCities = await City.countDocuments({ isActive: true });

        // Booking status breakdown
        // Booking status breakdown
        const pendingBookings = await Booking.countDocuments({ status: { $in: ['pending', 'searching_vendor', 'waiting_vendor_response', 'waiting_user_approval'] } });
        const completedBookings = await Booking.countDocuments({ status: { $in: ['completed', 'work_completed'] } });
        const cancelledBookings = await Booking.countDocuments({ status: { $in: ['cancelled', 'cancelled_by_user', 'rejected', 'rejected_by_vendor', 'no_vendor_available'] } });
        const activeBookings = await Booking.countDocuments({ status: { $in: ['pending', 'confirmed', 'in_progress'] } });

        // Revenue calculations
        // 1. Total Revenue from Admin Wallet (Source of Truth)
        const currentAdmin = await Admin.findById(req.admin._id);
        const totalRevenue = currentAdmin ? (currentAdmin.totalRevenue || 0) : 0;

        // 2. Helper to calculate commission (20% of Gross)
        const COMMISSION_RATE = 0.20;

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayBookings = await Booking.countDocuments({ createdAt: { $gte: today } });
        const todayRevenueData = await Booking.aggregate([
            { $match: { status: { $in: ['completed', 'work_completed'] }, createdAt: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const todayRevenue = todayRevenueData.length > 0 ? (todayRevenueData[0].total * COMMISSION_RATE) : 0;

        // This week's stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyBookings = await Booking.countDocuments({ createdAt: { $gte: weekAgo } });
        const weeklyRevenueData = await Booking.aggregate([
            { $match: { status: { $in: ['completed', 'work_completed'] }, createdAt: { $gte: weekAgo } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const weeklyRevenue = weeklyRevenueData.length > 0 ? (weeklyRevenueData[0].total * COMMISSION_RATE) : 0;

        // This month's stats
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const monthlyBookings = await Booking.countDocuments({ createdAt: { $gte: monthAgo } });
        const monthlyRevenueData = await Booking.aggregate([
            { $match: { status: { $in: ['completed', 'work_completed'] }, createdAt: { $gte: monthAgo } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const monthlyRevenue = monthlyRevenueData.length > 0 ? (monthlyRevenueData[0].total * COMMISSION_RATE) : 0;

        // Revenue trend (last 7 days - Commission based)
        const revenueTrend = await Booking.aggregate([
            {
                $match: {
                    status: { $in: ['completed', 'work_completed'] },
                    createdAt: { $gte: weekAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    grossRevenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    revenue: { $multiply: ['$grossRevenue', COMMISSION_RATE] } // Returns 20%
                }
            }
        ]);

        // Top services by bookings (Revenue displayed is commission or gross? Usually Gross for Service popularity, but let's keep Gross for context or switch to Commission? User asked for "revenue" in dashboard to be 20% cut. I will assume Top Services "Revenue" column might be Gross GMV, but to be consistent, I'll allow it to stay Gross or change to Commission. The Main KPI "Total Revenue" is fixed. Top Services usually shows GMV. I'll leave Top Services as is or update if needed. I'll update it to be safe.)
        const topServices = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$serviceName',
                    bookings: { $sum: 1 },
                    grossRevenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { bookings: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 1,
                    bookings: 1,
                    revenue: { $multiply: ['$grossRevenue', COMMISSION_RATE] }
                }
            }
        ]);

        // Get recent activity
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email phone createdAt').lean();
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email phone')
            .populate('vendor', 'businessName name phone')
            .lean();

        console.log('DEBUG DASHBOARD: recentBookings count:', recentBookings.length);
        console.log('DEBUG DASHBOARD: recentUsers count:', recentUsers.length);

        res.json({
            success: true,
            data: {
                stats: {
                    // Basic counts
                    totalUsers,
                    totalVendors,
                    activeVendors,
                    verifiedVendors,
                    pendingVendors,
                    blockedVendors,
                    totalBookings,
                    totalServices,

                    // Booking status
                    pendingBookings,
                    completedBookings,
                    cancelledBookings,
                    activeBookings,

                    // Revenue
                    totalRevenue,
                    revenue: totalRevenue,
                    todayRevenue,
                    weeklyRevenue,
                    monthlyRevenue,

                    // Time-based bookings
                    todayBookings,
                    weeklyBookings,
                    monthlyBookings,
                },
                charts: {
                    revenueTrend,
                    topServices
                },
                recentActivity: {
                    users: recentUsers,
                    bookings: recentBookings
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-__v').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Toggle User Block Status
// @route   PUT /api/admin/users/:id/block
// @access  Private
exports.toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Toggle user block error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get All Vendors
// @route   GET /api/admin/vendors
// @access  Private
exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().select('-__v').sort({ createdAt: -1 });
        res.json({ success: true, data: vendors });
    } catch (error) {
        console.error('Get vendors error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify Vendor
// @route   PUT /api/admin/vendors/:id/verify
// @access  Private
exports.verifyVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        vendor.isVerified = true;
        await vendor.save();
        res.json({ success: true, data: vendor });
    } catch (error) {
        console.error('Verify vendor error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Toggle Vendor Block Status
// @route   PUT /api/admin/vendors/:id/block
// @access  Private
exports.toggleVendorBlock = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        vendor.isBlocked = !vendor.isBlocked;
        await vendor.save();
        res.json({ success: true, data: vendor });
    } catch (error) {
        console.error('Toggle vendor block error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get All Bookings
// @route   GET /api/admin/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email phone')
            .populate('vendor', 'businessName phone name')
            .select('-__v')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get All Services
// @route   GET /api/admin/services
// @access  Private
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json({ success: true, data: services });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create Service
// @route   POST /api/admin/services
// @access  Private
exports.createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update Service
// @route   PUT /api/admin/services/:id
// @access  Private
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json({ success: true, data: service });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete Service
// @route   DELETE /api/admin/services/:id
// @access  Private
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update Admin Profile
// @route   PUT /api/admin/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== admin.email) {
            const emailExists = await Admin.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            admin.email = email;
        }

        if (name) admin.name = name;
        if (phone) admin.phone = phone;

        await admin.save();

        res.json({
            success: true,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                profileImage: admin.profileImage,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Upload Admin Profile Photo
// @route   POST /api/admin/profile/photo
// @access  Private
exports.uploadProfilePhoto = async (req, res) => {
    try {
        const cloudinary = require('cloudinary').v2;

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        if (!req.body.image) {
            return res.status(400).json({ success: false, message: 'No image provided' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.body.image, {
            folder: 'admin_profiles',
            transformation: [
                { width: 500, height: 500, crop: 'fill' },
                { quality: 'auto' }
            ]
        });

        // Update admin profile
        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // Delete old image from Cloudinary if exists
        if (admin.profileImage && admin.profileImage.includes('cloudinary')) {
            const publicId = admin.profileImage.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId).catch(err => console.log('Error deleting old image:', err));
        }

        admin.profileImage = result.secure_url;
        await admin.save();

        res.json({
            success: true,
            data: {
                profileImage: admin.profileImage
            }
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ success: false, message: 'Server error uploading photo' });
    }
};

// @desc    Change Admin Password
// @route   PUT /api/admin/password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // Check current password
        const isMatch = await admin.checkPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Set new password
        await admin.setPassword(newPassword);
        await admin.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Register new Admin (Pending Approval)
// @route   POST /api/admin/register
// @access  Public
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const exists = await Admin.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const admin = new Admin({
            name,
            email,
            phone,
            role: 'admin',
            isVerified: false
        });
        await admin.setPassword(password);
        await admin.save();

        res.status(201).json({ success: true, message: 'Request sent to Master Admin for approval' });
    } catch (error) {
        console.error('Register admin error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get Pending Admins
// @route   GET /api/admin/pending
// @access  Private (Super Admin)
exports.getPendingAdmins = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin' && req.admin.email !== 'masteradmin@urban.com') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        // Include false or undefined/null
        const admins = await Admin.find({ isVerified: { $ne: true } }).select('-passwordHash');
        res.json({ success: true, data: admins });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get Active Admins
// @route   GET /api/admin/active
// @access  Private (Super Admin)
exports.getActiveAdmins = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin' && req.admin.email !== 'masteradmin@urban.com') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const admins = await Admin.find({ isVerified: true }).select('-passwordHash');
        res.json({ success: true, data: admins });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Approve Admin
// @route   PUT /api/admin/:id/approve
// @access  Private (Super Admin)
exports.approveAdmin = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin' && req.admin.email !== 'masteradmin@urban.com') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const admin = await Admin.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        res.json({ success: true, data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete Admin
// @route   DELETE /api/admin/admins/:id
// @access  Private (Super Admin)
exports.deleteAdmin = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin' && req.admin.email !== 'masteradmin@urban.com') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (req.params.id === req.admin._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
        }
        await Admin.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Admin deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update Admin
// @route   PUT /api/admin/admins/:id
// @access  Private (Super Admin)
exports.updateAdmin = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin' && req.admin.email !== 'masteradmin@urban.com') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const { name, phone, email } = req.body;
        const admin = await Admin.findByIdAndUpdate(req.params.id, { name, phone, email }, { new: true }).select('-passwordHash');
        res.json({ success: true, data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
