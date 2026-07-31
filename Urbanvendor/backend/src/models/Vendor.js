const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  address: String,
  city: String,
  state: String,
  pincode: String,
});

const KYCSchema = new mongoose.Schema({
  aadharNumber: String,
  aadharFront: String,
  aadharBack: String,
  panNumber: String,
  panImage: String,
  certificates: [String],
  isVerified: { type: Boolean, default: false },
  verificationDate: Date,
});

const BankDetailsSchema = new mongoose.Schema({
  accountNumber: String,
  ifscCode: String,
  accountHolderName: String,
  bankName: String,
  isVerified: { type: Boolean, default: false },
});

const VendorSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    gender: { type: String },
    dob: { type: String },
    profileImage: { type: String },
    isOnline: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
    fcmToken: { type: String }, // For Push Notifications

    // Rating & Performance
    avgRating: { type: Number, default: 5 },
    ratingCount: { type: Number, default: 0 },

    // Availability & Scheduling
    serviceDurationMinutes: { type: Number, default: 60 },
    workingHours: {
      type: Object,
      default: { start: "09:00", end: "21:00" }
    },
    nextAvailableAt: { type: Date, default: Date.now },

    totalJobs: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now },

    services: { type: Array, default: [] },
    workingHours: { type: Object, default: {} },
    todayEarnings: { type: Number, default: 0 }, // Reset nightly via cron/job
    totalEarnings: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    location: LocationSchema,
    kyc: KYCSchema,
    bankDetails: BankDetailsSchema,
    workingRadius: { type: Number, default: 10 },
    experience: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    passwordHash: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', VendorSchema);
