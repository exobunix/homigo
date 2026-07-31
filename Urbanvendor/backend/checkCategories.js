const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./src/models/Category');

dotenv.config();

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected\n');

        // Get all categories
        const allCategories = await Category.find().sort({ level: 1, name: 1 });

        console.log(`📊 Total Categories: ${allCategories.length}\n`);

        // Group by level
        const mainCategories = allCategories.filter(c => c.level === 'main');
        const subCategories = allCategories.filter(c => c.level === 'sub');
        const childCategories = allCategories.filter(c => c.level === 'child');

        console.log(`📁 Main Categories: ${mainCategories.length}`);
        console.log(`📁 Sub Categories: ${subCategories.length}`);
        console.log(`📁 Child Categories: ${childCategories.length}\n`);

        // Check main categories
        console.log('='.repeat(80));
        console.log('MAIN CATEGORIES (with icons/images):');
        console.log('='.repeat(80));
        mainCategories.forEach((cat, index) => {
            console.log(`\n${index + 1}. ${cat.name}`);
            console.log(`   ID: ${cat._id}`);
            console.log(`   Icon: ${cat.icon || 'NOT SET'}`);
            console.log(`   Image: ${cat.image || 'NOT SET'}`);
            console.log(`   Has Icon/Image: ${cat.icon || cat.image ? '✅ YES' : '❌ NO'}`);
        });

        // Check sub categories
        console.log('\n' + '='.repeat(80));
        console.log('SUB CATEGORIES (with images):');
        console.log('='.repeat(80));
        subCategories.forEach((cat, index) => {
            console.log(`\n${index + 1}. ${cat.name}`);
            console.log(`   ID: ${cat._id}`);
            console.log(`   Parent: ${cat.parentCategory || 'NOT SET'}`);
            console.log(`   Icon: ${cat.icon || 'NOT SET'}`);
            console.log(`   Image: ${cat.image || 'NOT SET'}`);
            console.log(`   Has Icon/Image: ${cat.icon || cat.image ? '✅ YES' : '❌ NO'}`);
        });

        // Check child categories
        console.log('\n' + '='.repeat(80));
        console.log('CHILD CATEGORIES (with images):');
        console.log('='.repeat(80));
        childCategories.forEach((cat, index) => {
            console.log(`\n${index + 1}. ${cat.name}`);
            console.log(`   ID: ${cat._id}`);
            console.log(`   Parent: ${cat.parentCategory || 'NOT SET'}`);
            console.log(`   Icon: ${cat.icon || 'NOT SET'}`);
            console.log(`   Image: ${cat.image || 'NOT SET'}`);
            console.log(`   Has Icon/Image: ${cat.icon || cat.image ? '✅ YES' : '❌ NO'}`);
        });

        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('SUMMARY:');
        console.log('='.repeat(80));
        const mainWithImages = mainCategories.filter(c => c.icon || c.image).length;
        const subWithImages = subCategories.filter(c => c.icon || c.image).length;
        const childWithImages = childCategories.filter(c => c.icon || c.image).length;

        console.log(`Main categories with icons/images: ${mainWithImages}/${mainCategories.length}`);
        console.log(`Sub categories with icons/images: ${subWithImages}/${subCategories.length}`);
        console.log(`Child categories with icons/images: ${childWithImages}/${childCategories.length}`);

        if (mainWithImages === 0) {
            console.log('\n⚠️  WARNING: No main categories have icons/images set!');
        }
        if (subWithImages === 0) {
            console.log('⚠️  WARNING: No sub categories have icons/images set!');
        }
        if (childWithImages === 0) {
            console.log('⚠️  WARNING: No child categories have icons/images set!');
        }

        process.exit();
    } catch (error) {
        console.error('Error checking categories:', error);
        process.exit(1);
    }
};

checkCategories();
