const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () { return this.target === 'specific'; }
  },
  target: {
    type: String,
    enum: ['specific', 'all', 'vendor', 'user', 'admin'],
    default: 'specific'
  },
  recipientModel: {
    type: String,
    enum: ['User', 'Vendor', 'Admin'],
    default: 'User'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderModel: {
    type: String,
    enum: ['User', 'Vendor', 'Admin'],
    default: 'Admin'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: function () { return !this.body; }
  },
  body: {
    type: String,
    required: function () { return !this.message; }
  },
  type: {
    type: String,
    enum: ['booking', 'system', 'promotion', 'alert', 'message', 'admin_announcement', 'info', 'warning', 'success'],
    default: 'system'
  },
  data: {
    type: Object,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to normalize body to message
notificationSchema.pre('save', function (next) {
  if (this.body && !this.message) {
    this.message = this.body;
  }
  next();
});

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
