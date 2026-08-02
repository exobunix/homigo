require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const mongoose = require('mongoose');
const Addon = require('../models/Addon');
const Category = require('../models/Category');

const ADDONS_BY_CATEGORY = {
    // Salon Services - Women
    'Salon for Women': [
        { name: 'Hair style - 200', description: 'Professional hair styling service', price: 200, duration: 45, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400' },
        { name: 'Anti-dandruff shampoo - 400', description: 'Premium anti-dandruff treatment', price: 400, duration: 30, image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=400' },
        { name: 'Hair Spa Treatment - 600', description: 'Deep conditioning hair spa', price: 600, duration: 60, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400' },
        { name: 'Hair Color Touch-up - 500', description: 'Root touch-up service', price: 500, duration: 90, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
        { name: 'Blow Dry - 300', description: 'Professional blow dry styling', price: 300, duration: 30, image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400' },
        { name: 'Hair Smoothening - 800', description: 'Keratin smoothening treatment', price: 800, duration: 120, image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400' },
        { name: 'Scalp Massage - 150', description: 'Relaxing scalp massage', price: 150, duration: 20, image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400' },
        { name: 'Hair Rebonding - 1200', description: 'Permanent hair straightening', price: 1200, duration: 180, image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400' },
        { name: 'Hair Extensions - 1500', description: 'Premium hair extension service', price: 1500, duration: 120, image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400' },
        { name: 'Deep Conditioning - 350', description: 'Intensive hair conditioning', price: 350, duration: 40, image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400' },
    ],

    // Salon Services - Men
    'Salon for Men': [
        { name: 'Hair style - 200', description: 'Modern hair styling', price: 200, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400' },
        { name: 'Hair Shampoo + Wash - 500', description: 'Premium shampoo and wash', price: 500, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400' },
        { name: 'Beard Styling - 150', description: 'Professional beard trim and style', price: 150, image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400' },
        { name: 'Hair Color - 400', description: 'Hair coloring service', price: 400, image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400' },
        { name: 'Scalp Treatment - 300', description: 'Deep scalp cleansing', price: 300, image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400' },
        { name: 'Face Cleanup - 250', description: 'Basic facial cleanup', price: 250, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' },
        { name: 'Beard Coloring - 300', description: 'Professional beard coloring', price: 300, image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400' },
        { name: 'Hair Spa - 450', description: 'Relaxing hair spa treatment', price: 450, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400' },
        { name: 'Head Massage - 200', description: 'Therapeutic head massage', price: 200, image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400' },
        { name: 'Hair Straightening - 600', description: 'Temporary hair straightening', price: 600, image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400' },
    ],

    // Home Cleaning
    'Home Cleaning': [
        { name: 'Deep Cleaning - 500', description: 'Thorough deep cleaning service', price: 500, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400' },
        { name: 'Kitchen Cleaning - 300', description: 'Detailed kitchen cleaning', price: 300, image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400' },
        { name: 'Bathroom Cleaning - 250', description: 'Complete bathroom sanitization', price: 250, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400' },
        { name: 'Window Cleaning - 200', description: 'Interior window cleaning', price: 200, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400' },
        { name: 'Balcony Cleaning - 150', description: 'Balcony sweep and mop', price: 150, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
        { name: 'Appliance Cleaning - 400', description: 'Fridge, oven, microwave cleaning', price: 400, image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400' },
        { name: 'Sofa Cleaning - 350', description: 'Professional sofa deep cleaning', price: 350, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
        { name: 'Carpet Cleaning - 400', description: 'Deep carpet shampooing', price: 400, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
        { name: 'Mattress Cleaning - 450', description: 'Mattress sanitization service', price: 450, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' },
        { name: 'Chimney Cleaning - 500', description: 'Kitchen chimney deep cleaning', price: 500, image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400' },
    ],

    // AC Services
    'AC Repair': [
        { name: 'Gas Refilling - 800', description: 'AC gas top-up service', price: 800, image: 'https://images.unsplash.com/photo-1631545806609-c2f1e9c1e6b0?w=400' },
        { name: 'Deep Cleaning - 600', description: 'Complete AC deep clean', price: 600, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400' },
        { name: 'Filter Replacement - 300', description: 'New filter installation', price: 300, image: 'https://images.unsplash.com/photo-1635274531661-1d6b9e1c6e9f?w=400' },
        { name: 'Coil Cleaning - 400', description: 'Evaporator and condenser coil cleaning', price: 400, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400' },
        { name: 'Outdoor Unit Cleaning - 350', description: 'External unit maintenance', price: 350, image: 'https://images.unsplash.com/photo-1631545806609-c2f1e9c1e6b0?w=400' },
        { name: 'Compressor Repair - 1200', description: 'AC compressor repair service', price: 1200, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400' },
        { name: 'Thermostat Replacement - 500', description: 'New thermostat installation', price: 500, image: 'https://images.unsplash.com/photo-1635274531661-1d6b9e1c6e9f?w=400' },
        { name: 'Duct Cleaning - 700', description: 'Air duct cleaning service', price: 700, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400' },
        { name: 'PCB Repair - 900', description: 'Circuit board repair', price: 900, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400' },
        { name: 'Drain Pipe Cleaning - 250', description: 'AC drain pipe unclogging', price: 250, image: 'https://images.unsplash.com/photo-1631545806609-c2f1e9c1e6b0?w=400' },
    ],

    // Plumbing Services
    'Plumbing': [
        { name: 'Emergency Service - 500', description: 'Priority emergency response', price: 500, image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400' },
        { name: 'Pipe Replacement - 400', description: 'Replace damaged pipes', price: 400, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400' },
        { name: 'Drain Cleaning - 300', description: 'Clear blocked drains', price: 300, image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400' },
        { name: 'Leak Detection - 350', description: 'Advanced leak detection', price: 350, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400' },
        { name: 'Water Tank Cleaning - 600', description: 'Complete tank sanitization', price: 600, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400' },
        { name: 'Tap Installation - 250', description: 'New tap fitting service', price: 250, image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400' },
        { name: 'Toilet Repair - 400', description: 'Toilet flush and cistern repair', price: 400, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400' },
        { name: 'Water Heater Installation - 800', description: 'Geyser installation service', price: 800, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400' },
        { name: 'Bathroom Fitting - 1000', description: 'Complete bathroom fitting', price: 1000, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400' },
        { name: 'Sewer Line Cleaning - 700', description: 'Main sewer line cleaning', price: 700, image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400' },
    ],

    // Electrical Services
    'Electrical': [
        { name: 'Emergency Service - 500', description: 'Priority emergency response', price: 500, image: 'https://images.unsplash.com/photo-1621905252472-178b8e7f2f7a?w=400' },
        { name: 'Wiring Inspection - 400', description: 'Complete wiring check', price: 400, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400' },
        { name: 'Switch/Socket Replacement - 200', description: 'Replace faulty switches', price: 200, image: 'https://images.unsplash.com/photo-1621905252472-178b8e7f2f7a?w=400' },
        { name: 'MCB Installation - 350', description: 'Install circuit breaker', price: 350, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400' },
        { name: 'Earthing Check - 300', description: 'Verify earthing system', price: 300, image: 'https://images.unsplash.com/photo-1621905252472-178b8e7f2f7a?w=400' },
        { name: 'Fan Installation - 250', description: 'Ceiling fan installation', price: 250, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
        { name: 'Light Fixture Installation - 300', description: 'Install new light fixtures', price: 300, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400' },
        { name: 'DB Box Installation - 600', description: 'Distribution board setup', price: 600, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400' },
        { name: 'Inverter Installation - 800', description: 'Home inverter setup', price: 800, image: 'https://images.unsplash.com/photo-1621905252472-178b8e7f2f7a?w=400' },
        { name: 'Doorbell Installation - 150', description: 'Doorbell fitting service', price: 150, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    ],

    // Painting Services
    'Painting': [
        { name: 'Premium Paint - 1000', description: 'Upgrade to premium paint', price: 1000, image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400' },
        { name: 'Texture Painting - 800', description: 'Decorative texture finish', price: 800, image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=400' },
        { name: 'Waterproofing - 600', description: 'Waterproof coating', price: 600, image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=400' },
        { name: 'Wall Putty - 500', description: 'Wall preparation with putty', price: 500, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400' },
        { name: 'Ceiling Painting - 700', description: 'Ceiling paint service', price: 700, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400' },
        { name: 'Exterior Painting - 1200', description: 'Outdoor wall painting', price: 1200, image: 'https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?w=400' },
        { name: 'Stencil Design - 900', description: 'Decorative stencil work', price: 900, image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=400' },
        { name: 'Wood Polishing - 650', description: 'Furniture polishing service', price: 650, image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400' },
        { name: 'Metal Painting - 550', description: 'Metal surface painting', price: 550, image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400' },
        { name: 'Primer Coating - 400', description: 'Base primer application', price: 400, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400' },
    ],

    // Carpentry Services
    'Carpentry': [
        { name: 'Premium Wood - 800', description: 'Upgrade to premium wood', price: 800, image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400' },
        { name: 'Polish & Finish - 500', description: 'Professional wood polishing', price: 500, image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400' },
        { name: 'Hardware Upgrade - 400', description: 'Premium hinges and handles', price: 400, image: 'https://images.unsplash.com/photo-1614359770531-6f72b4d1b5b6?w=400' },
        { name: 'Custom Design - 1000', description: 'Custom carpentry design', price: 1000, image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400' },
        { name: 'Door Installation - 1200', description: 'New door fitting service', price: 1200, image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400' },
        { name: 'Cabinet Making - 1500', description: 'Custom cabinet construction', price: 1500, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400' },
        { name: 'Shelf Installation - 350', description: 'Wall shelf mounting', price: 350, image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400' },
        { name: 'Furniture Repair - 600', description: 'Furniture restoration service', price: 600, image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400' },
        { name: 'Wardrobe Installation - 2000', description: 'Built-in wardrobe setup', price: 2000, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400' },
        { name: 'Window Frame Repair - 450', description: 'Window frame restoration', price: 450, image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400' },
    ],

    // Pest Control
    'Pest Control': [
        { name: 'Herbal Treatment - 400', description: 'Eco-friendly pest control', price: 400, image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400' },
        { name: 'Termite Treatment - 800', description: 'Specialized termite control', price: 800, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400' },
        { name: 'Cockroach Treatment - 500', description: 'Targeted cockroach elimination', price: 500, image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400' },
        { name: 'Rodent Control - 600', description: 'Rat and mice control', price: 600, image: 'https://images.unsplash.com/photo-1628863353691-0071c8c1874c?w=400' },
        { name: 'Bed Bug Treatment - 700', description: 'Complete bed bug removal', price: 700, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' },
        { name: 'Mosquito Control - 450', description: 'Mosquito fogging service', price: 450, image: 'https://images.unsplash.com/photo-1599932509837-4b0c1d3c8f3e?w=400' },
        { name: 'Ant Control - 350', description: 'Ant colony elimination', price: 350, image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400' },
        { name: 'Wood Borer Treatment - 650', description: 'Wood borer pest control', price: 650, image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400' },
        { name: 'Lizard Control - 300', description: 'Lizard repellent service', price: 300, image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400' },
        { name: 'General Pest Control - 550', description: 'All-purpose pest treatment', price: 550, image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400' },
    ],

    // Appliance Repair
    'Appliance Repair': [
        { name: 'Spare Parts - 500', description: 'Genuine spare parts', price: 500, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400' },
        { name: 'Deep Cleaning - 300', description: 'Appliance deep cleaning', price: 300, image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400' },
        { name: 'Gas Leak Check - 400', description: 'Gas connection inspection', price: 400, image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400' },
        { name: 'Extended Warranty - 600', description: '6-month service warranty', price: 600, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400' },
        { name: 'Motor Replacement - 800', description: 'Appliance motor replacement', price: 800, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
        { name: 'Thermostat Repair - 450', description: 'Temperature control repair', price: 450, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400' },
        { name: 'Drum Replacement - 1000', description: 'Washing machine drum replacement', price: 1000, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400' },
        { name: 'Control Panel Repair - 550', description: 'Electronic panel repair', price: 550, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
        { name: 'Door Seal Replacement - 350', description: 'Replace door gasket', price: 350, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400' },
        { name: 'Compressor Repair - 1200', description: 'Refrigerator compressor repair', price: 1200, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400' },
    ],

    // Car Wash
    'Car Wash': [
        { name: 'Exterior Wash - 300', description: 'Complete exterior car wash', price: 300, image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400' },
        { name: 'Interior Cleaning - 400', description: 'Deep interior vacuuming and cleaning', price: 400, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400' },
        { name: 'Wax Polish - 500', description: 'Premium wax polishing service', price: 500, image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400' },
        { name: 'Engine Cleaning - 600', description: 'Engine bay deep cleaning', price: 600, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400' },
        { name: 'Ceramic Coating - 2000', description: 'Premium ceramic coating protection', price: 2000, image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400' },
        { name: 'Dashboard Polish - 250', description: 'Dashboard cleaning and polishing', price: 250, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400' },
        { name: 'Seat Shampooing - 450', description: 'Deep seat fabric cleaning', price: 450, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400' },
        { name: 'Headlight Restoration - 350', description: 'Headlight clarity restoration', price: 350, image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400' },
        { name: 'Underbody Wash - 400', description: 'Chassis and underbody cleaning', price: 400, image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400' },
        { name: 'Tire Dressing - 200', description: 'Tire shine and dressing', price: 200, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400' },
    ],

    // Laundry
    'Laundry': [
        { name: 'Wash & Iron - 150', description: 'Regular wash and iron service', price: 150, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400' },
        { name: 'Dry Cleaning - 300', description: 'Professional dry cleaning', price: 300, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400' },
        { name: 'Steam Iron - 100', description: 'Steam ironing service', price: 100, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400' },
        { name: 'Stain Removal - 200', description: 'Specialized stain treatment', price: 200, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400' },
        { name: 'Curtain Cleaning - 400', description: 'Large curtain cleaning', price: 400, image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400' },
        { name: 'Blanket Cleaning - 350', description: 'Heavy blanket washing', price: 350, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' },
        { name: 'Shoe Cleaning - 250', description: 'Shoe wash and polish', price: 250, image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400' },
        { name: 'Express Service - 200', description: 'Same-day laundry service', price: 200, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400' },
        { name: 'Delicate Fabric Care - 300', description: 'Special care for delicate items', price: 300, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400' },
        { name: 'Bedsheet Cleaning - 180', description: 'Bedsheet wash and fold', price: 180, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' },
    ],

    // Moving & Packing
    'Moving & Packing': [
        { name: 'Packing Materials - 500', description: 'Premium packing supplies', price: 500, image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400' },
        { name: 'Furniture Dismantling - 800', description: 'Furniture disassembly service', price: 800, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
        { name: 'Fragile Item Packing - 600', description: 'Special packing for fragile items', price: 600, image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400' },
        { name: 'Loading/Unloading - 700', description: 'Professional loading service', price: 700, image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400' },
        { name: 'Insurance Coverage - 1000', description: 'Goods insurance during transit', price: 1000, image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400' },
        { name: 'Storage Service - 1500', description: 'Temporary storage facility', price: 1500, image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400' },
        { name: 'Vehicle Transport - 2000', description: 'Car/bike transportation', price: 2000, image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400' },
        { name: 'Unpacking Service - 500', description: 'Unpacking and arrangement', price: 500, image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400' },
        { name: 'Furniture Assembly - 800', description: 'Furniture reassembly service', price: 800, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
        { name: 'Express Moving - 1200', description: 'Same-day moving service', price: 1200, image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400' },
    ],

    // Disinfection
    'Disinfection': [
        { name: 'Full Home Sanitization - 800', description: 'Complete home disinfection', price: 800, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400' },
        { name: 'Kitchen Disinfection - 400', description: 'Kitchen deep sanitization', price: 400, image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400' },
        { name: 'Bathroom Sanitization - 350', description: 'Bathroom deep disinfection', price: 350, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400' },
        { name: 'Office Sanitization - 1000', description: 'Commercial office disinfection', price: 1000, image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400' },
        { name: 'Car Sanitization - 500', description: 'Vehicle interior disinfection', price: 500, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400' },
        { name: 'Fogging Service - 600', description: 'Professional fogging treatment', price: 600, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400' },
        { name: 'UV Sanitization - 700', description: 'UV light disinfection', price: 700, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400' },
        { name: 'Surface Disinfection - 300', description: 'High-touch surface cleaning', price: 300, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400' },
        { name: 'Air Purification - 800', description: 'Air sanitization service', price: 800, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400' },
        { name: 'Monthly Package - 2500', description: 'Monthly disinfection service', price: 2500, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400' },
    ],

    // Smart Home
    'Smart Home': [
        { name: 'Smart Lock Installation - 1500', description: 'Smart door lock setup', price: 1500, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400' },
        { name: 'CCTV Installation - 2000', description: 'Security camera installation', price: 2000, image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400' },
        { name: 'Smart Lighting Setup - 1200', description: 'Automated lighting system', price: 1200, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400' },
        { name: 'Voice Assistant Setup - 800', description: 'Alexa/Google Home configuration', price: 800, image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=400' },
        { name: 'Smart Thermostat - 1000', description: 'Smart AC/heating control', price: 1000, image: 'https://images.unsplash.com/photo-1635274531661-1d6b9e1c6e9f?w=400' },
        { name: 'Video Doorbell - 1800', description: 'Smart doorbell installation', price: 1800, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400' },
        { name: 'Wi-Fi Mesh Setup - 1500', description: 'Whole-home Wi-Fi system', price: 1500, image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400' },
        { name: 'Smart Plug Installation - 500', description: 'Smart power outlet setup', price: 500, image: 'https://images.unsplash.com/photo-1621905252472-178b8e7f2f7a?w=400' },
        { name: 'Smart Curtain Setup - 1200', description: 'Automated curtain system', price: 1200, image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400' },
    ],
    'Gardening': [
        { name: 'Grass Cutting - 199', description: 'Lawn mowing and trimming', price: 199, image: 'https://images.unsplash.com/photo-1533460004989-cef01064af7e?w=400' },
        { name: 'Weeding & Pruning - 299', description: 'Removal of weeds and tree trimming', price: 299, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
        { name: 'Soil Fertilization - 399', description: 'Applying organic compost and fertilizer', price: 399, image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=400' },
        { name: 'Flower Planting - 249', description: 'Planting seeds/saplings of seasonal flowers', price: 249, image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400' },
        { name: 'Shrub Trimming - 349', description: 'Trimming and shaping shrubs/bushes', price: 349, image: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?w=400' }
    ]
};

async function seedAddons() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://urbanprox:URbanProx556677@urbanprox.hgd4ssb.mongodb.net/');
        console.log('✅ Connected to MongoDB');

        // Clear existing addons
        await Addon.deleteMany({});
        console.log('🗑️  Cleared existing addons');

        let totalAddons = 0;

        // Iterate through each category
        for (const [categoryName, addons] of Object.entries(ADDONS_BY_CATEGORY)) {
            // Find the category
            const category = await Category.findOne({ name: categoryName });

            if (!category) {
                console.log(`⚠️  Category "${categoryName}" not found, skipping...`);
                continue;
            }

            console.log(`\n📦 Processing category: ${categoryName}`);

            // Create addons for this category
            for (const addonData of addons) {
                const addon = await Addon.create({
                    name: addonData.name,
                    description: addonData.description,
                    price: addonData.price,
                    duration: addonData.duration || 30,
                    image: addonData.image,
                    category: category._id,
                    isActive: true
                });

                totalAddons++;
                console.log(`  ✓ Created: ${addon.name} - ₹${addon.price}`);
            }
        }

        console.log(`\n✅ Successfully seeded ${totalAddons} addons across ${Object.keys(ADDONS_BY_CATEGORY).length} categories!`);

        // Display summary
        const addonsByCategory = await Addon.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: '$categoryInfo'
            },
            {
                $group: {
                    _id: '$categoryInfo.name',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        console.log('\n📊 Summary by Category:');
        console.log('─'.repeat(80));
        console.log('Category'.padEnd(25) + '| Count | Avg Price | Min Price | Max Price');
        console.log('─'.repeat(80));
        addonsByCategory.forEach(cat => {
            const avg = Math.round(cat.totalValue / cat.count);
            console.log(
                `${cat._id.padEnd(25)}| ${String(cat.count).padStart(5)} | ₹${String(avg).padStart(7)} | ₹${String(cat.minPrice).padStart(7)} | ₹${String(cat.maxPrice).padStart(7)}`
            );
        });
        console.log('─'.repeat(80));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding addons:', error);
        process.exit(1);
    }
}

// Run the seeder
seedAddons();
