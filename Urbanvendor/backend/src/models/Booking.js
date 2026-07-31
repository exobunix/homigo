const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    customerName: String,
    customerPhone: String,
    customerLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    serviceName: String,
    serviceId: String,
    items: Array,

    // Smart Booking Fields
    candidateVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    rejectedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    candidateIndex: { type: Number, default: 0 },
    proposedVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },

    serviceDateTime: Date,
    serviceDurationMinutes: Number,

    vendorOfferExpiresAt: Date,
    userApprovalExpiresAt: Date,
    rejectionReason: String,

    scheduledDate: String,
    scheduledTime: String,
    status: {
      type: String,
      enum: [
        'searching_vendor',
        'waiting_vendor_response',
        'waiting_user_approval',
        'no_vendor_available',
        'pending',
        'accepted',
        'confirmed',
        'on_the_way',
        'arrived',
        'work_started',
        'work_completed',
        'cancelled',
        'cancelled_by_user',
        'rejected',
        'rejected_by_vendor'
      ],
      default: 'pending',
    },
    totalAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'cod' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    // Lifecycle Timestamps
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    arrivedAt: Date,

    // OTP Verification for Service Completion
    completionOtp: {
      type: String,
      select: false, // Don't return by default for security
    },
    otpVerifiedAt: {
      type: Date,
    },
    detailsHiddenFromVendor: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
