import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: String, // e.g., 'Electrician', 'Plumber'
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  locationStr: String,
  providerName: String,
  date: Date,
  
  // Status Management
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'In-Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  
  // Emergency & Priority
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent', 'Emergency'],
    default: 'Normal',
  },
  
  // 1-Day Guarantee Logic
  guarantee: {
    isActive: { type: Boolean, default: true },
    expiryTime: { type: Date }, // Set to 24h after completion
    reworked: { type: Boolean, default: false },
    refunded: { type: Boolean, default: false },
  },

  // Live Tracking (Uber-like)
  tracking: {
    providerLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    eta: { type: Number }, // Estimated Time of Arrival in minutes
  },

  // Payments (EasyPaisa / JazzCash)
  payment: {
    method: { type: String, enum: ['Cash', 'EasyPaisa', 'JazzCash'] },
    status: { type: String, enum: ['Unpaid', 'Paid', 'Refunded'], default: 'Unpaid' },
    transactionId: String,
    convenienceFee: { type: Number, default: 0 },
  },

}, {
  timestamps: true,
});

BookingSchema.index({ "tracking.providerLocation": "2dsphere" });

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export default Booking;
