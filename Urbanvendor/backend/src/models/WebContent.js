const mongoose = require('mongoose');

const webContentSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        unique: true, // e.g., 'home'
        default: 'home'
    },
    hero: {
        title: { type: String, default: 'Home services at your doorstep' },
        subtitle: { type: String, default: 'Hygenic, Safe & Insured' },
        image: { type: String, default: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template,q_auto:low,f_auto/dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/home-screen/1696852847761-574450.jpeg' },
        trendingTags: [{ type: String }]
    },
    spotlight: [{
        title: String,
        icon: String,
        color: String,
        textColor: String
    }],
    whyChooseUs: [{
        title: String,
        text: String,
        icon: String
    }],
    flashSale: {
        isActive: { type: Boolean, default: true },
        title: { type: String, default: 'Save up to 50%' },
        subtitle: { type: String, default: 'On your first Home Cleaning booking' },
        endTime: { type: Date }
    },
    paintingBanner: {
        image: { type: String, default: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_1232,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1735893886310-6dbc53.jpeg' }
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WebContent', webContentSchema);
