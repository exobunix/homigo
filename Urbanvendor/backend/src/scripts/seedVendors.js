require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const Service = require('../models/Service');
const Vendor = require('../models/Vendor');
const Testimonial = require('../models/Testimonial');

const MASTER_SERVICES = [
    { id: '1', name: 'Plumbing', icon: 'pipe-wrench', color: '#3b82f6', basePrice: 499, image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800' },
    { id: '2', name: 'Electrical', icon: 'lightning-bolt', color: '#f59e0b', basePrice: 399, image: 'https://images.unsplash.com/photo-1621905251189-fc015acafd31?w=800' },
    { id: '3', name: 'Cleaning', icon: 'broom', color: '#10b981', basePrice: 999, image: 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=800' },
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

const MOCK_TESTIMONIALS = [
    {
        name: "Aarav Sharma",
        role: "Homeowner",
        message: "Homigo service was exceptional! The technician arrived on time, was extremely polite, and resolved our AC issue in under 30 minutes. Highly recommended!",
        rating: 5,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        active: true
    },
    {
        name: "Priya Patel",
        role: "Apartment Resident",
        message: "Booked deep cleaning for my kitchen. The team did an incredibly thorough job. Every nook and cranny is sparkling clean!",
        rating: 5,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        active: true
    },
    {
        name: "Rohan Das",
        role: "Working Professional",
        message: "Extremely convenient. The plumber was professional and fixed our leaky pipes quickly. The price was exactly as quoted upfront.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        active: true
    }
];

const seedData = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found');
        const dbName = uri.split('/').pop().split('?')[0];
        await mongoose.connect(uri, { dbName });
        console.log('Connected to MongoDB');

        // 1. Seed Master Services
        await Service.deleteMany({});
        await Service.insertMany(MASTER_SERVICES);
        console.log('✅ Seeded master services');

        // 2. Seed Testimonials
        await Testimonial.deleteMany({});
        await Testimonial.insertMany(MOCK_TESTIMONIALS);
        console.log('✅ Seeded testimonials');

        // 3. Seed Vendors with Services
        await Vendor.deleteMany({});
        const vendors = [
            {
                name: "Yogesh Thakur",
                phone: "9876543210",
                email: "yogesh@homigo.com",
                gender: "Male",
                isOnline: true,
                avgRating: 4.9,
                ratingCount: 28,
                totalJobs: 42,
                services: [
                    { id: "s-ac-1", name: "AC Repair", active: true, price: 499, description: "Complete split & window AC repair and checkup service." },
                    { id: "s-app-1", name: "Appliance Repair", active: true, price: 449, description: "Professional diagnostic and repair for all household appliances." },
                    { id: "s-plumb-1", name: "Plumbing", active: true, price: 499, description: "Faucet installations, leak repairs, and general pipe fittings." }
                ],
                location: {
                    latitude: 28.6139,
                    longitude: 77.2090,
                    address: "Connaught Place, New Delhi",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001"
                },
                isVerified: true
            },
            {
                name: "Rajesh Kumar",
                phone: "9123456780",
                email: "rajesh@homigo.com",
                gender: "Male",
                isOnline: true,
                avgRating: 4.8,
                ratingCount: 15,
                totalJobs: 24,
                services: [
                    { id: "s-cw-1", name: "Car Wash", active: true, price: 599, description: "Premium eco-friendly doorstep car wash & inside vacuuming." },
                    { id: "s-laun-1", name: "Laundry", active: true, price: 299, description: "Doorstep pickup & delivery wash, iron, and dry cleaning." },
                    { id: "s-clean-1", name: "Cleaning", active: true, price: 999, description: "Full home deep cleaning and sanitization." }
                ],
                location: {
                    latitude: 28.5355,
                    longitude: 77.3910,
                    address: "Sector 62, Noida",
                    city: "Noida",
                    state: "Uttar Pradesh",
                    pincode: "201301"
                },
                isVerified: true
            },
            {
                name: "Amit Sharma",
                phone: "9234567891",
                email: "amit@homigo.com",
                gender: "Male",
                isOnline: true,
                avgRating: 4.7,
                ratingCount: 12,
                totalJobs: 19,
                services: [
                    { id: "s-paint-1", name: "Painting", active: true, price: 1499, description: "Top-tier interior & exterior wall painting service." },
                    { id: "s-carp-1", name: "Carpentry", active: true, price: 599, description: "Furniture repairs, modular upgrades, and custom installations." }
                ],
                location: {
                    latitude: 28.4595,
                    longitude: 77.0266,
                    address: "Sector 45, Gurugram",
                    city: "Gurugram",
                    state: "Haryana",
                    pincode: "122003"
                },
                isVerified: true
            }
        ];

        await Vendor.insertMany(vendors);
        console.log('✅ Seeded vendors with services successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
