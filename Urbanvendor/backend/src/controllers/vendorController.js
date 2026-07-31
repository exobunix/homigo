const Vendor = require('../models/Vendor');
const Service = require('../models/Service');

exports.getVendors = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        if (category) {
            query['services'] = {
                $elemMatch: {
                    name: { $regex: new RegExp(category, 'i') },
                    active: true
                }
            };
        }

        const vendors = await Vendor.find(query).select('-passwordHash');
        const masterServices = await Service.find({ active: true });
        const imageMap = {};
        masterServices.forEach(ms => {
            imageMap[ms.name] = ms.image;
        });

        // Transform data to match UserUrban expectations
        const transformedVendors = vendors.map(vendor => {
            const vendorObj = vendor.toObject();

            // Map services to match UserUrban Service interface
            vendorObj.services = vendorObj.services
                .filter(s => s.active)
                .map(s => ({
                    id: s.id,
                    title: s.name, // Map name to title
                    name: s.name, // Keep name for backward compat if needed
                    description: s.description || `${s.name} service`,
                    price: typeof s.price === 'string' ? parseInt(s.price.replace(/[^0-9]/g, '') || 0) : (s.basePrice || 0),
                    image: s.image || imageMap[s.name],
                    category: s.name, // Using name as category for now
                    subCategory: s.name,
                    rating: 4.8, // Dummy rating if not present
                    reviewCount: 10
                }));

            return vendorObj;
        });

        res.json({
            success: true,
            data: transformedVendors
        });
    } catch (error) {
        console.error('getVendors error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch vendors' });
    }
};

exports.getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id).select('-passwordHash');

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        const vendorObj = vendor.toObject();
        const masterServices = await Service.find({ active: true });
        const imageMap = {};
        masterServices.forEach(ms => {
            imageMap[ms.name] = ms.image;
        });

        // Transform services
        vendorObj.services = vendorObj.services
            .filter(s => s.active)
            .map(s => ({
                id: s.id,
                title: s.name,
                name: s.name,
                description: s.description || `${s.name} service`,
                price: typeof s.price === 'string' ? parseInt(s.price.replace(/[^0-9]/g, '') || 0) : (s.basePrice || 0),
                image: s.image || imageMap[s.name],
                category: s.name,
                subCategory: s.name,
                rating: 4.8,
                reviewCount: 10
            }));

        res.json({
            success: true,
            data: vendorObj
        });
    } catch (error) {
        console.error('getVendorById error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch vendor details' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;
        const vendor = await Vendor.findByIdAndUpdate(
            req.user._id,
            { isOnline },
            { new: true }
        ).select('-passwordHash');

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.json({ success: true, data: vendor, message: `You are now ${isOnline ? 'Online' : 'Offline'}` });
    } catch (error) {
        console.error('updateStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
};
exports.getAvailableVendors = async (req, res) => {
    try {
        const { serviceId, time, location } = req.query;
        const requestedTime = new Date(time || Date.now());

        // 1. Build query to filter by Online Status & Service
        let query = {
            isOnline: true,
        };

        // If serviceId is provided, filter vendors who have this service
        if (serviceId) {
            query['services.id'] = serviceId;
        }

        const vendors = await Vendor.find(query).select('-passwordHash');

        const availableVendors = [];

        for (const vendor of vendors) {
            // 3. Calculate Next Available Time
            const duration = 60 * 60 * 1000; // 1 hour in ms
            const reqEnd = new Date(requestedTime.getTime() + duration);

            const Booking = require('../models/Booking');
            const overlappingBookings = await Booking.find({
                vendor: vendor._id,
                status: { $in: ['confirmed', 'accepted', 'on_the_way', 'work_started'] },
                $or: [
                    {
                        serviceDateTime: { $lt: reqEnd },
                        $expr: {
                            $gt: [
                                { $add: ["$serviceDateTime", { $multiply: [{ $ifNull: ["$serviceDurationMinutes", 60] }, 60000] }] },
                                requestedTime
                            ]
                        }
                    }
                ]
            });

            let nextAvailableAt = requestedTime;
            if (overlappingBookings.length > 0) {
                let maxEndTime = requestedTime.getTime();
                overlappingBookings.forEach(b => {
                    const bTime = b.serviceDateTime ? new Date(b.serviceDateTime).getTime() : 0;
                    const bDur = b.serviceDurationMinutes || 60;
                    const endTime = bTime + (bDur * 60000);
                    if (endTime > maxEndTime) maxEndTime = endTime;
                });
                nextAvailableAt = new Date(maxEndTime);
            }

            // 4. Compute Score
            const waitingMinutes = Math.max(0, (nextAvailableAt - requestedTime) / 60000);
            const score = (vendor.avgRating * 10) - waitingMinutes;

            // 5. Include vendor services and location info
            availableVendors.push({
                _id: vendor._id,
                name: vendor.name,
                rating: vendor.rating || vendor.avgRating,
                avgRating: vendor.avgRating,
                ratingCount: vendor.ratingCount || 0,
                totalJobs: vendor.totalJobs || 0,
                nextAvailableAt,
                score,
                image: vendor.profileImage,
                profileImage: vendor.profileImage,
                workingHours: vendor.workingHours,
                location: vendor.location,
                services: vendor.services.filter(s => s.active).map(s => ({ id: s.id, name: s.name }))
            });
        }

        // 5. Sort
        availableVendors.sort((a, b) => b.score - a.score);

        res.json({ success: true, data: availableVendors });
    } catch (error) {
        console.error('getAvailableVendors error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch available vendors' });
    }
};

exports.checkVendorAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time } = req.query;

        if (!date || !time) {
            return res.status(400).json({ success: false, message: 'Date and time are required' });
        }

        const requestedTime = new Date(`${date} ${time}`);
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        if (!vendor.isOnline) {
            return res.json({ success: true, available: false, message: 'Vendor is currently offline' });
        }

        // Check for overlapping bookings
        const duration = 60 * 60 * 1000; // 1 hour default
        const reqEnd = new Date(requestedTime.getTime() + duration);

        const Booking = require('../models/Booking');
        const overlappingBookings = await Booking.find({
            vendor: vendor._id,
            status: { $in: ['confirmed', 'accepted', 'on_the_way', 'work_started'] },
            $or: [
                {
                    serviceDateTime: { $lt: reqEnd },
                    $expr: {
                        $gt: [
                            { $add: ["$serviceDateTime", { $multiply: [{ $ifNull: ["$serviceDurationMinutes", 60] }, 60000] }] },
                            requestedTime
                        ]
                    }
                }
            ]
        });

        if (overlappingBookings.length > 0) {
            return res.json({ success: true, available: false, message: 'Vendor is busy at this time' });
        }

        res.json({ success: true, available: true, message: 'Vendor is available' });

    } catch (error) {
        console.error('checkVendorAvailability error:', error);
        res.status(500).json({ success: false, message: 'Failed to check availability' });
    }
};
