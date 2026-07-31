const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'admin@urbanprox.com';
        const password = 'admin123';

        // Check if admin exists
        let admin = await Admin.findOne({ email });

        if (admin) {
            console.log('Admin already exists. Updating password...');
            await admin.setPassword(password);
            await admin.save();
            console.log('Admin password updated to: admin123');
        } else {
            console.log('Creating new admin...');
            admin = new Admin({
                name: 'Super Admin',
                email: email,
                role: 'super_admin'
            });

            await admin.setPassword(password);
            await admin.save();
            console.log('Admin created successfully!');
        }

        console.log('Credentials:');
        console.log('Email: admin@urbanprox.com');
        console.log('Password: admin123');

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
