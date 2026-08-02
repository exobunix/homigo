require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const mongoose = require('mongoose');
const Service = require('../models/Service');
const Category = require('../models/Category');

const seedCategories = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is not set in env');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        // Complete category structure with 15 main categories and realistic prices
        const categoryData = {
            'home-cleaning': {
                name: 'Home Cleaning',
                image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
                price: 499,
                subCategories: [
                    {
                        name: 'Deep Cleaning',
                        image: 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=800',
                        price: 799,
                        children: [
                            { name: 'Kitchen Deep Clean', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800', price: 699, duration: 90 },
                            { name: 'Bathroom Deep Clean', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', price: 599, duration: 60 },
                            { name: 'Full Home Deep Clean', image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800', price: 1999, duration: 240 },
                            { name: 'Sofa Cleaning', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', price: 899, duration: 45 },
                            { name: 'Carpet Deep Clean', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', price: 799, duration: 60 }
                        ]
                    },
                    {
                        name: 'Regular Cleaning',
                        image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
                        price: 399,
                        children: [
                            { name: 'Daily Cleaning', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800', price: 299 },
                            { name: 'Weekly Cleaning', image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800', price: 499 },
                            { name: 'Monthly Cleaning', image: 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=800', price: 1499 }
                        ]
                    },
                    {
                        name: 'Specialized Cleaning',
                        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                        price: 599,
                        children: [
                            { name: 'Window Cleaning', image: 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800', price: 499 },
                            { name: 'Balcony Cleaning', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', price: 399 },
                            { name: 'Chimney Cleaning', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', price: 699 }
                        ]
                    }
                ]
            },
            'plumbing': {
                name: 'Plumbing',
                image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
                price: 399,
                subCategories: [
                    {
                        name: 'Installation',
                        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800',
                        price: 499,
                        children: [
                            { name: 'Tap Installation', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800', price: 299, duration: 30 },
                            { name: 'Sink Installation', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', price: 599, duration: 60 },
                            { name: 'Toilet Installation', image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800', price: 799, duration: 90 },
                            { name: 'Geyser Installation', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800', price: 999, duration: 60 }
                        ]
                    },
                    {
                        name: 'Repair',
                        image: 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?w=800',
                        price: 299,
                        children: [
                            { name: 'Tap Repair', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800', price: 199 },
                            { name: 'Pipe Leak Repair', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800', price: 399 },
                            { name: 'Drain Blockage', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', price: 499 },
                            { name: 'Toilet Repair', image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800', price: 599 }
                        ]
                    },
                    {
                        name: 'Maintenance',
                        image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
                        price: 599,
                        children: [
                            { name: 'Tank Cleaning', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', price: 799 },
                            { name: 'Pipe Inspection', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800', price: 399 },
                            { name: 'Drainage Cleaning', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', price: 699 }
                        ]
                    }
                ]
            },
            'electrical': {
                name: 'Electrical',
                image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
                price: 349,
                subCategories: [
                    {
                        name: 'Installation',
                        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
                        price: 399,
                        children: [
                            { name: 'Light Installation', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', price: 199, duration: 30 },
                            { name: 'Fan Installation', image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800', price: 299, duration: 45 },
                            { name: 'Switch Installation', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', price: 149, duration: 15 },
                            { name: 'Wiring', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', price: 599, duration: 120 }
                        ]
                    },
                    {
                        name: 'Repair',
                        image: 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?w=800',
                        price: 249,
                        children: [
                            { name: 'Light Repair', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', price: 149, duration: 30 },
                            { name: 'Fan Repair', image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800', price: 199, duration: 45 },
                            { name: 'Switch Repair', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', price: 99, duration: 15 },
                            { name: 'Circuit Repair', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', price: 499, duration: 60 }
                        ]
                    }
                ]
            },
            'painting': {
                name: 'Painting',
                image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
                price: 1499,
                subCategories: [
                    {
                        name: 'Interior Painting',
                        image: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800',
                        price: 1999,
                        children: [
                            { name: 'Wall Painting', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800', price: 1499, duration: 240 },
                            { name: 'Ceiling Painting', image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800', price: 999, duration: 180 },
                            { name: 'Door Painting', image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=800', price: 499, duration: 60 },
                            { name: 'Room Painting', image: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800', price: 2499, duration: 360 }
                        ]
                    },
                    {
                        name: 'Exterior Painting',
                        image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=800',
                        price: 2999,
                        children: [
                            { name: 'Outer Wall Painting', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800', price: 3999, duration: 480 },
                            { name: 'Gate Painting', image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=800', price: 799, duration: 120 },
                            { name: 'Balcony Painting', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', price: 1499, duration: 180 }
                        ]
                    }
                ]
            },
            'carpentry': {
                name: 'Carpentry',
                image: 'https://images.unsplash.com/photo-1622151834677-70f982c9adef?w=800',
                price: 799,
                subCategories: [
                    {
                        name: 'Furniture Making',
                        image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800',
                        price: 2999,
                        children: [
                            { name: 'Bed Making', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', price: 4999, duration: 480 },
                            { name: 'Wardrobe Making', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800', price: 7999, duration: 600 },
                            { name: 'Table Making', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800', price: 2499, duration: 240 },
                            { name: 'Chair Making', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800', price: 1499, duration: 180 }
                        ]
                    },
                    {
                        name: 'Furniture Repair',
                        image: 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?w=800',
                        price: 499,
                        children: [
                            { name: 'Bed Repair', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', price: 699, duration: 60 },
                            { name: 'Wardrobe Repair', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800', price: 899, duration: 90 },
                            { name: 'Door Repair', image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=800', price: 599, duration: 45 }
                        ]
                    }
                ]
            },
            'ac-repair': {
                name: 'AC Repair & Service',
                image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
                price: 499,
                subCategories: [
                    {
                        name: 'AC Service',
                        image: 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800',
                        price: 599,
                        children: [
                            { name: 'Window AC Service', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', price: 499, duration: 45 },
                            { name: 'Split AC Service', image: 'https://plus.unsplash.com/premium_photo-1663047395066-5e0322237936?w=800', price: 699, duration: 60 },
                            { name: 'Central AC Service', image: 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800', price: 1499, duration: 120 }
                        ]
                    },
                    {
                        name: 'AC Repair',
                        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
                        price: 799,
                        children: [
                            { name: 'Gas Filling', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', price: 1999, duration: 45 },
                            { name: 'Compressor Repair', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', price: 2999, duration: 120 },
                            { name: 'Cooling Issue', image: 'https://plus.unsplash.com/premium_photo-1663047395066-5e0322237936?w=800', price: 899, duration: 60 }
                        ]
                    }
                ]
            },
            'beauty': {
                name: 'Salon for Women',
                image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
                price: 599,
                subCategories: [
                    {
                        name: 'Hair Care',
                        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
                        price: 499,
                        children: [
                            { name: 'Hair Cut', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', price: 299, duration: 45 },
                            { name: 'Hair Color', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', price: 1499, duration: 90 },
                            { name: 'Hair Spa', image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800', price: 799, duration: 60 },
                            { name: 'Hair Straightening', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', price: 2999, duration: 120 }
                        ]
                    },
                    {
                        name: 'Skin Care',
                        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
                        price: 699,
                        children: [
                            { name: 'Facial', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', price: 599, duration: 60 },
                            { name: 'Cleanup', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800', price: 399, duration: 30 },
                            { name: 'Bleach', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800', price: 299, duration: 30 }
                        ]
                    },
                    {
                        name: 'Makeup',
                        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
                        price: 1499,
                        children: [
                            { name: 'Party Makeup', image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', price: 1999, duration: 90 },
                            { name: 'Bridal Makeup', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800', price: 4999, duration: 180 },
                            { name: 'HD Makeup', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', price: 2499, duration: 120 }
                        ]
                    }
                ]
            },
            'mens-salon': {
                name: 'Salon for Men',
                image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
                price: 299,
                subCategories: [
                    {
                        name: 'Hair Services',
                        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
                        price: 199,
                        children: [
                            { name: 'Hair Cut', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800', price: 149, duration: 30 },
                            { name: 'Beard Trim', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800', price: 99, duration: 20 },
                            { name: 'Shaving', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800', price: 149, duration: 20 },
                            { name: 'Hair Color', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800', price: 799, duration: 45 }
                        ]
                    },
                    {
                        name: 'Grooming',
                        image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800',
                        price: 399,
                        children: [
                            { name: 'Facial', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', price: 399, duration: 45 },
                            { name: 'Cleanup', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800', price: 299, duration: 30 },
                            { name: 'Head Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', price: 199, duration: 20 }
                        ]
                    }
                ]
            },
            'pest-control': {
                name: 'Pest Control',
                image: 'https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=800',
                price: 699,
                subCategories: [
                    {
                        name: 'General Pest Control',
                        image: 'https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=800',
                        price: 599,
                        children: [
                            { name: 'Cockroach Control', image: 'https://images.unsplash.com/photo-1632935190508-8f4a3da9f447?w=800', price: 499, duration: 45 },
                            { name: 'Ant Control', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', price: 399, duration: 45 },
                            { name: 'Mosquito Control', image: 'https://images.unsplash.com/photo-1632323094858-d7b76afbb5a1?w=800', price: 599, duration: 60 }
                        ]
                    },
                    {
                        name: 'Specialized Control',
                        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
                        price: 999,
                        children: [
                            { name: 'Termite Control', image: 'https://images.unsplash.com/photo-1632935190508-8f4a3da9f447?w=800', price: 1499, duration: 120 },
                            { name: 'Bed Bug Control', image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800', price: 1299, duration: 90 },
                            { name: 'Rodent Control', image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800', price: 899, duration: 60 }
                        ]
                    }
                ]
            },
            'car-wash': {
                name: 'Car Wash',
                image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800',
                price: 399,
                subCategories: [
                    {
                        name: 'Exterior Wash',
                        image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800',
                        price: 299,
                        children: [
                            { name: 'Hatchback Wash', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800', price: 199, duration: 45 },
                            { name: 'Sedan Wash', image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800', price: 249, duration: 60 },
                            { name: 'SUV Wash', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800', price: 349, duration: 75 },
                            { name: 'Bike Wash', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800', price: 149, duration: 30 }
                        ]
                    },
                    {
                        name: 'Interior Cleaning',
                        image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800',
                        price: 499,
                        children: [
                            { name: 'Vacuum Cleaning', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800', price: 299, duration: 30 },
                            { name: 'Seat Dry Cleaning', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800', price: 699, duration: 60 },
                            { name: 'Dashboard Polishing', image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800', price: 399, duration: 30 }
                        ]
                    },
                    {
                        name: 'Detailing',
                        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
                        price: 1999,
                        children: [
                            { name: 'Ceramic Coating', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800', price: 2999, duration: 240 },
                            { name: 'Teflon Coating', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800', price: 1999, duration: 180 },
                            { name: 'Rubbing & Polishing', image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800', price: 1499, duration: 120 }
                        ]
                    }
                ]
            },
            'laundry': {
                name: 'Laundry',
                image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800',
                price: 199,
                subCategories: [
                    {
                        name: 'Wash & Iron',
                        image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800',
                        price: 149,
                        children: [
                            { name: 'Regular Clothes', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800', price: 99, duration: 48 },
                            { name: 'Premium Clothes', image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800', price: 199, duration: 48 },
                            { name: 'Delicate Clothes', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800', price: 249, duration: 48 },
                            { name: 'Curtains', image: 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800', price: 399, duration: 48 }
                        ]
                    },
                    {
                        name: 'Dry Cleaning',
                        image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800',
                        price: 299,
                        children: [
                            { name: 'Suit Dry Clean', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', price: 399, duration: 72 },
                            { name: 'Saree Dry Clean', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800', price: 299, duration: 72 },
                            { name: 'Jacket Dry Clean', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', price: 349, duration: 72 }
                        ]
                    },
                    {
                        name: 'Shoe Laundry',
                        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
                        price: 199,
                        children: [
                            { name: 'Sports Shoes', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800', price: 149, duration: 48 },
                            { name: 'Leather Shoes', image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800', price: 199, duration: 48 },
                            { name: 'Canvas Shoes', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800', price: 129, duration: 48 }
                        ]
                    }
                ]
            },
            'appliance-repair': {
                name: 'Appliance Repair',
                image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
                price: 499,
                subCategories: [
                    {
                        name: 'Kitchen Appliances',
                        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
                        price: 599,
                        children: [
                            { name: 'Refrigerator Repair', image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800', price: 799, duration: 60 },
                            { name: 'Microwave Repair', image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800', price: 499, duration: 45 },
                            { name: 'Washing Machine Repair', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800', price: 699, duration: 60 },
                            { name: 'Dishwasher Repair', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', price: 899, duration: 60 }
                        ]
                    },
                    {
                        name: 'Home Appliances',
                        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
                        price: 499,
                        children: [
                            { name: 'TV Repair', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', price: 799, duration: 60 },
                            { name: 'Geyser Repair', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800', price: 599, duration: 45 },
                            { name: 'Water Purifier Repair', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', price: 699, duration: 45 }
                        ]
                    }
                ]
            },
            'moving-packing': {
                name: 'Moving & Packing',
                image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800',
                price: 2999,
                subCategories: [
                    {
                        name: 'Local Shifting',
                        image: 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=800',
                        price: 1999,
                        children: [
                            { name: 'Home Shifting', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800', price: 2999, duration: 480 },
                            { name: 'Office Shifting', image: 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=800', price: 4999, duration: 600 },
                            { name: 'Furniture Shifting', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800', price: 1499, duration: 180 },
                            { name: 'Bike Shifting', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800', price: 999, duration: 60 }
                        ]
                    },
                    {
                        name: 'Packing Services',
                        image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800',
                        price: 1499,
                        children: [
                            { name: 'Furniture Packing', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800', price: 999, duration: 120 },
                            { name: 'Fragile Items Packing', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800', price: 1499, duration: 180 },
                            { name: 'Electronics Packing', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', price: 1299, duration: 90 }
                        ]
                    },
                    {
                        name: 'Storage',
                        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
                        price: 2499,
                        children: [
                            { name: 'Warehouse Storage', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800', price: 1999, duration: 60 },
                            { name: 'Temporary Storage', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800', price: 1499, duration: 60 },
                            { name: 'Long-term Storage', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800', price: 2999, duration: 60 }
                        ]
                    }
                ]
            },
            'disinfection': {
                name: 'Disinfection',
                image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800',
                price: 599,
                subCategories: [
                    {
                        name: 'Home Disinfection',
                        image: 'https://images.unsplash.com/photo-1585830812416-a6c86bb14576?w=800',
                        price: 699,
                        children: [
                            { name: 'Full Home Sanitization', image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800', price: 999, duration: 60 },
                            { name: 'Bathroom Disinfection', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', price: 399, duration: 30 },
                            { name: 'Kitchen Disinfection', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800', price: 499, duration: 30 }
                        ]
                    },
                    {
                        name: 'Commercial Disinfection',
                        image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800',
                        price: 1499,
                        children: [
                            { name: 'Office Sanitization', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', price: 1999, duration: 90 },
                            { name: 'Shop Disinfection', image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800', price: 1299, duration: 60 },
                            { name: 'Restaurant Sanitization', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', price: 1799, duration: 90 }
                        ]
                    },
                    {
                        name: 'Vehicle Disinfection',
                        image: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=800',
                        price: 399,
                        children: [
                            { name: 'Car Disinfection', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800', price: 499, duration: 30 },
                            { name: 'Bike Disinfection', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800', price: 299, duration: 15 },
                            { name: 'Bus Disinfection', image: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=800', price: 1499, duration: 60 }
                        ]
                    }
                ]
            },
            'smart-home': {
                name: 'Smart Home',
                image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
                price: 999,
                subCategories: [
                    {
                        name: 'Automation Setup',
                        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
                        price: 1499,
                        children: [
                            { name: 'Smart Lighting Setup', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', price: 999, duration: 60 },
                            { name: 'Smart Plug Installation', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', price: 499, duration: 30 },
                            { name: 'Voice Assistant Setup', image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800', price: 799, duration: 45 }
                        ]
                    },
                    {
                        name: 'Security Systems',
                        image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800',
                        price: 2999,
                        children: [
                            { name: 'CCTV Installation', image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800', price: 3999, duration: 120 },
                            { name: 'Video Doorbell Installation', image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800', price: 1999, duration: 60 },
                            { name: 'Smart Lock Installation', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', price: 1499, duration: 60 }
                        ]
                    },
                    {
                        name: 'Network & Wi-Fi',
                        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
                        price: 799,
                        children: [
                            { name: 'Wi-Fi Mesh Setup', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800', price: 1299, duration: 90 },
                            { name: 'Router Configuration', image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800', price: 399, duration: 45 },
                            { name: 'LAN Cabling', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', price: 599, duration: 120 }
                        ]
                    }
                ]
            },
            'gardening': {
                name: 'Gardening',
                image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
                price: 399,
                subCategories: [
                    {
                        name: 'Lawn Care',
                        image: 'https://images.unsplash.com/photo-1558905619-8714c64af463?w=800',
                        price: 299,
                        children: [
                            { name: 'Grass Cutting', image: 'https://images.unsplash.com/photo-1533460004989-cef01064af7e?w=800', price: 199, duration: 45 },
                            { name: 'Weeding & Pruning', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', price: 299, duration: 60 },
                            { name: 'Fertilization', image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=800', price: 399, duration: 30 }
                        ]
                    },
                    {
                        name: 'Plantation',
                        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
                        price: 399,
                        children: [
                            { name: 'Flower Planting', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800', price: 249, duration: 60 },
                            { name: 'Shrub Trimming', image: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?w=800', price: 349, duration: 60 }
                        ]
                    }
                ]
            }
        };

        let mainCategoriesCreated = 0;
        let subCategoriesCreated = 0;
        let childCategoriesCreated = 0;

        // Create categories from predefined data
        const categoryKeys = Object.keys(categoryData);

        for (const key of categoryKeys) {
            const categoryInfo = categoryData[key];

            // Create Main Category
            const mainCategory = await Category.create({
                name: categoryInfo.name,
                level: 'main',
                image: categoryInfo.image,
                price: categoryInfo.price || 0,
                icon: 'cube-outline',
                description: `Professional ${categoryInfo.name} services`,
                isActive: true
            });
            mainCategoriesCreated++;
            console.log(`✓ Created main category: ${mainCategory.name}`);

            // Create Sub Categories
            for (const subCat of categoryInfo.subCategories) {
                const subCategory = await Category.create({
                    name: subCat.name,
                    level: 'sub',
                    parentCategory: mainCategory._id,
                    image: subCat.image,
                    price: subCat.price || 0,
                    description: `${subCat.name} services under ${mainCategory.name}`,
                    isActive: true
                });
                subCategoriesCreated++;
                console.log(`  ✓ Created sub category: ${subCategory.name}`);

                // Create Child Categories
                for (const child of subCat.children) {
                    const childCategory = await Category.create({
                        name: child.name,
                        level: 'child',
                        parentCategory: subCategory._id,
                        image: child.image,
                        price: child.price || 0,
                        duration: child.duration || 60, // Default duration 60 mins
                        description: `${child.name} service`,
                        isActive: true
                    });
                    childCategoriesCreated++;
                    console.log(`    ✓ Created child category: ${childCategory.name}`);
                }
            }
        }

        console.log('\n========================================');
        console.log('🎉 SEEDING COMPLETE!');
        console.log('========================================');
        console.log(`📦 Main Categories: ${mainCategoriesCreated}`);
        console.log(`📂 Sub Categories: ${subCategoriesCreated}`);
        console.log(`📄 Child Categories: ${childCategoriesCreated}`);
        console.log(`📊 Total Categories: ${mainCategoriesCreated + subCategoriesCreated + childCategoriesCreated}`);
        console.log('========================================\n');

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
