const Category = require('../models/Category');
const Addon = require('../models/Addon');
const TimeSlot = require('../models/TimeSlot');
const Banner = require('../models/Banner');
const City = require('../models/City');
const Payout = require('../models/Payout');
const Notification = require('../models/Notification');
const Testimonial = require('../models/Testimonial');
const CountryCode = require('../models/CountryCode');
const WebContent = require('../models/WebContent');

// ============ CATEGORY MANAGEMENT ============

// Get all categories with hierarchy
exports.getCategories = async (req, res) => {
    try {
        const { level, parentCategory } = req.query;
        const filter = {};
        if (level) filter.level = level;
        if (parentCategory) filter.parentCategory = parentCategory;

        const categories = await Category.find(filter)
            .populate('parentCategory', 'name')
            .sort({ order: 1, createdAt: -1 });

        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parentCategory', 'name');

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.json({ success: true, data: category });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.json({ success: true, data: category });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ ADDON MANAGEMENT ============

// Get all addons
exports.getAddons = async (req, res) => {
    try {
        const { categoryId } = req.query;

        // Build query filter
        let query = {};
        if (categoryId) {
            query.category = categoryId;
        }

        const addons = await Addon.find(query)
            .populate('service', 'name')
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: addons });
    } catch (error) {
        console.error('Get addons error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create addon
exports.createAddon = async (req, res) => {
    try {
        const addon = await Addon.create(req.body);
        res.status(201).json({ success: true, data: addon });
    } catch (error) {
        console.error('Create addon error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update addon
exports.updateAddon = async (req, res) => {
    try {
        const addon = await Addon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!addon) {
            return res.status(404).json({ success: false, message: 'Addon not found' });
        }

        res.json({ success: true, data: addon });
    } catch (error) {
        console.error('Update addon error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete addon
exports.deleteAddon = async (req, res) => {
    try {
        const addon = await Addon.findByIdAndDelete(req.params.id);

        if (!addon) {
            return res.status(404).json({ success: false, message: 'Addon not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete addon error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ TIME SLOT MANAGEMENT ============

// Get all time slots
exports.getTimeSlots = async (req, res) => {
    try {
        const timeSlots = await TimeSlot.find()
            .populate('service', 'name')
            .populate('category', 'name')
            .sort({ startTime: 1 });

        res.json({ success: true, data: timeSlots });
    } catch (error) {
        console.error('Get time slots error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create time slot
exports.createTimeSlot = async (req, res) => {
    try {
        const timeSlot = await TimeSlot.create(req.body);
        res.status(201).json({ success: true, data: timeSlot });
    } catch (error) {
        console.error('Create time slot error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update time slot
exports.updateTimeSlot = async (req, res) => {
    try {
        const timeSlot = await TimeSlot.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!timeSlot) {
            return res.status(404).json({ success: false, message: 'Time slot not found' });
        }

        res.json({ success: true, data: timeSlot });
    } catch (error) {
        console.error('Update time slot error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete time slot
exports.deleteTimeSlot = async (req, res) => {
    try {
        const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id);

        if (!timeSlot) {
            return res.status(404).json({ success: false, message: 'Time slot not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete time slot error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ BANNER MANAGEMENT ============

// Get all banners
exports.getBanners = async (req, res) => {
    try {
        const { position, isActive } = req.query;
        const filter = {};
        if (position) filter.position = position;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });

        res.json({ success: true, data: banners });
    } catch (error) {
        console.error('Get banners error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create banner
exports.createBanner = async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json({ success: true, data: banner });
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update banner
exports.updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.json({ success: true, data: banner });
    } catch (error) {
        console.error('Update banner error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete banner error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ CITY MANAGEMENT ============

// Get all cities
exports.getCities = async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const cities = await City.find(filter).sort({ name: 1 });

        res.json({ success: true, data: cities });
    } catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create city
exports.createCity = async (req, res) => {
    try {
        const city = await City.create(req.body);
        res.status(201).json({ success: true, data: city });
    } catch (error) {
        console.error('Create city error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update city
exports.updateCity = async (req, res) => {
    try {
        const city = await City.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!city) {
            return res.status(404).json({ success: false, message: 'City not found' });
        }

        res.json({ success: true, data: city });
    } catch (error) {
        console.error('Update city error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete city
exports.deleteCity = async (req, res) => {
    try {
        const city = await City.findByIdAndDelete(req.params.id);

        if (!city) {
            return res.status(404).json({ success: false, message: 'City not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete city error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ PAYOUT MANAGEMENT ============

// Get all payouts
exports.getPayouts = async (req, res) => {
    try {
        const { status, vendorId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (vendorId) filter.vendor = vendorId;

        const payouts = await Payout.find(filter)
            .populate('vendor', 'businessName name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: payouts });
    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create payout (Manual)
exports.createPayout = async (req, res) => {
    try {
        const payout = await Payout.create(req.body);
        res.status(201).json({ success: true, data: payout });
    } catch (error) {
        console.error('Create payout error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update payout status
exports.updatePayout = async (req, res) => {
    try {
        const payout = await Payout.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout not found' });
        }

        res.json({ success: true, data: payout });
    } catch (error) {
        console.error('Update payout error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ NOTIFICATION MANAGEMENT ============

exports.getNotifications = async (req, res) => {
    try {
        const { target } = req.query;
        const filter = {};
        if (target) filter.target = target;
        const notifications = await Notification.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const { emitToRole, emitToUser } = require('../socket/socketHandler');

// ... (existing imports)

exports.createNotification = async (req, res) => {
    try {
        const notification = await Notification.create(req.body);

        // Emit Real-time
        const io = req.app.get('io');
        if (io) {
            const { target, title, body, type } = notification;

            const eventData = {
                title: title || notification.title,
                body: body || notification.message || notification.body,
                type: type || notification.type || 'admin_announcement',
                data: notification
            };

            if (target === 'specific' && notification.recipient) {
                // Emit to specific user/vendor
                io.to(notification.recipient.toString()).emit('admin_notification', eventData);
                console.log(`📢 Emitted to specific recipient: ${notification.recipient}`);
            } else if (target && target !== 'specific') {
                // Broadcast to role or all
                if (target === 'all') {
                    // Emit to both users and vendors
                    io.to('users').emit('admin_notification', eventData);
                    io.to('vendors').emit('admin_notification', eventData);
                    console.log('📢 Emitted to ALL (users + vendors)');
                } else if (target === 'user') {
                    // Emit to users room
                    io.to('users').emit('admin_notification', eventData);
                    console.log('📢 Emitted to users room');
                } else if (target === 'vendor') {
                    // Emit to vendors room
                    io.to('vendors').emit('admin_notification', eventData);
                    console.log('📢 Emitted to vendors room');
                } else {
                    // Fallback: emit to the target as room name
                    io.to(target).emit('admin_notification', eventData);
                    console.log(`📢 Emitted to room: ${target}`);
                }
            }
        }

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        console.error('Create Notification Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ TESTIMONIAL MANAGEMENT ============

exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json({ success: true, data: testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.create(req.body);
        res.status(201).json({ success: true, data: testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ COUNTRY CODE MANAGEMENT ============

exports.getCountryCodes = async (req, res) => {
    try {
        const codes = await CountryCode.find().sort({ countryName: 1 });
        res.json({ success: true, data: codes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createCountryCode = async (req, res) => {
    try {
        const code = await CountryCode.create(req.body);
        res.status(201).json({ success: true, data: code });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateCountryCode = async (req, res) => {
    try {
        const code = await CountryCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: code });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteCountryCode = async (req, res) => {
    try {
        await CountryCode.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ WEB CONTENT MANAGEMENT ============

exports.getWebContent = async (req, res) => {
    try {
        const { page } = req.query;
        let content = await WebContent.findOne({ page: page || 'home' });

        if (!content) {
            // Create default if not exists
            content = await WebContent.create({ page: page || 'home' });
        }

        res.json({ success: true, data: content });
    } catch (error) {
        console.error('Get web content error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateWebContent = async (req, res) => {
    try {
        let content;
        if (req.params.id) {
            content = await WebContent.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true, upsert: true }
            );
        } else {
            const page = req.body.page || 'home';
            content = await WebContent.findOneAndUpdate(
                { page: page },
                req.body,
                { new: true, runValidators: true, upsert: true }
            );
        }

        res.json({ success: true, data: content });
    } catch (error) {
        console.error('Update web content error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
