const Vendor = require('../models/Vendor');
const Service = require('../models/Service');

exports.getMasterServices = async (req, res) => {
    try {
        const services = await Service.find({ active: true });
        res.json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.seedServices = async (req, res) => {
    try {
        const services = [
            { id: '1', name: 'Plumbing', icon: 'pipe-wrench', color: '#3b82f6', basePrice: 499, image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800' },
            { id: '2', name: 'Electrical', icon: 'lightning-bolt', color: '#f59e0b', basePrice: 399, image: 'https://images.unsplash.com/photo-1621905251189-fc015acafd31?w=800' },
            { id: '3', name: 'Cleaning', icon: 'broom', color: '#10b981', basePrice: 999, image: 'https://images.unsplash.com/photo-1581578731117-104f2a8d2305?w=800' },
            { id: '4', name: 'Painting', icon: 'format-paint', color: '#ef4444', basePrice: 1499, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800' },
            { id: '5', name: 'Carpentry', icon: 'hammer', color: '#8b5cf6', basePrice: 599, image: 'https://images.unsplash.com/photo-1622151834677-70f982c9adef?w=800' },
            { id: '6', name: 'AC Repair', icon: 'air-conditioner', color: '#06b6d4', basePrice: 499, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800' },
            { id: '7', name: 'Pest Control', icon: 'bug', color: '#a855f7', basePrice: 899, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800' },
            { id: '8', name: 'Home Salon', icon: 'face-woman', color: '#ec4899', basePrice: 799, image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800' },
            { id: '9', name: 'Gardening', icon: 'flower', color: '#22c55e', basePrice: 399, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800' },
            { id: '10', name: 'Car Wash', icon: 'car-wash', color: '#3b82f6', basePrice: 599, image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800' },
            { id: '11', name: 'Laundry', icon: 'washing-machine', color: '#6366f1', basePrice: 299, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800' },
            { id: '12', name: 'Appliance Repair', icon: 'tools', color: '#f97316', basePrice: 449, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800' },
            { id: '13', name: 'Moving & Packing', icon: 'truck-delivery', color: '#14b8a6', basePrice: 2999, image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800' },
            { id: '14', name: 'Disinfection', icon: 'spray-bottle', color: '#0ea5e9', basePrice: 699, image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800' },
            { id: '15', name: 'Smart Home', icon: 'home-automation', color: '#8b5cf6', basePrice: 999, image: 'https://images.unsplash.com/photo-1558002038-1091a166111c?w=800' },
        ];

        await Service.deleteMany({});
        await Service.insertMany(services);

        res.json({ success: true, message: 'Services seeded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllServices = async (req, res) => {
    const { category, subCategory } = req.query;

    try {
        res.set('Cache-Control', 'no-store'); // Prevent 304 Not Modified
        let query = {};

        // UserUrban sends 'category' which matches our 'name' (e.g. 'Plumbing')
        if (category) {
            query['services'] = {
                $elemMatch: {
                    name: { $regex: new RegExp(category, 'i') },
                    active: true
                }
            };
        }

        // If no category, we might want to return all services from all vendors?
        // Or just return nothing/error? For now, let's return all active services.
        if (!category && !subCategory) {
            query['services.active'] = true;
        }

        const vendors = await Vendor.find(query).select('name profileImage rating totalJobs location services');
        const masterServices = await Service.find({ active: true });
        const imageMap = {};
        masterServices.forEach(ms => {
            imageMap[ms.name] = ms.image;
        });

        // Extract all services from these vendors and flatten them into a single list
        let allServices = [];
        vendors.forEach(vendor => {
            vendor.services.forEach(service => {
                if (!service.active) return;

                // Filter again on the client side to be precise
                if (category && !service.name.toLowerCase().includes(category.toLowerCase())) return;
                // if (subCategory && service.subCategory !== subCategory) return;

                allServices.push({
                    id: service.id,
                    title: service.name, // UserUrban expects title
                    name: service.name,
                    description: service.description || `${service.name} service provided by ${vendor.name}`,
                    price: typeof service.price === 'string' ? parseInt(service.price.replace(/[^0-9]/g, '') || 0) : (service.basePrice || 0),
                    image: service.image || imageMap[service.name],
                    category: service.name, // Map name to category
                    subCategory: service.name,
                    rating: vendor.rating || 4.8,
                    reviewCount: vendor.totalJobs || 0,

                    // Extra vendor info
                    vendorId: vendor._id,
                    vendorName: vendor.name,
                    vendorImage: vendor.profileImage
                });
            });
        });

        res.json({ success: true, data: allServices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getServiceById = async (req, res) => {
    const { id } = req.params;
    // This is tricky if services are embedded in Vendors without unique IDs.
    // Ideally, services should have IDs. 
    // For now, we'll search all vendors for a service with this ID.

    try {
        const vendor = await Vendor.findOne({ 'services.id': id });

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const service = vendor.services.find(s => s.id === id);
        const masterService = await Service.findOne({ name: service.name });

        res.json({
            success: true,
            data: {
                id: service.id,
                title: service.name,
                name: service.name,
                description: service.description || `${service.name} service provided by ${vendor.name}`,
                price: typeof service.price === 'string' ? parseInt(service.price.replace(/[^0-9]/g, '') || 0) : (service.basePrice || 0),
                image: service.image || (masterService ? masterService.image : null),
                category: service.name,
                subCategory: service.name,
                rating: vendor.rating || 4.8,
                reviewCount: vendor.totalJobs || 0,

                vendorId: vendor._id,
                vendorName: vendor.name,
                vendorImage: vendor.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
