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
    required: false, // Optional for open bookings
  },
  service: {
    type: String, // e.g., 'Electrician', 'Plumber'
    required: true,
  },
  details: {
    type: String,
    required: false,
  },
  voiceUrl: {
    type: String, // URL/Path to voice message detail
    required: false,
  },
  mediaUrls: {
    type: [String], // URLs to photos or videos (optional)
    default: [],
  },
  budget: {
    type: Number,
    required: true,
    default: 0,
  },
  hours: {
    type: Number, // Estimated or actual hours for job
    default: 1,
  },
  hourlyRate: {
    type: Number, // Hourly rate set by the provider for transparency
    default: 0,
  },
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  locationStr: String,
  providerName: String,
  providerPhone: String,
  date: Date,
  visitTime: Date, // Time specified by provider when accepting
  
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

  // Payments (SadaPay / Cash)
  payment: {
    method: { type: String, enum: ['Cash', 'SadaPay'], default: 'Cash' },
    status: { type: String, enum: ['Unpaid', 'Paid', 'Refunded'], default: 'Unpaid' },
    transactionId: String,
    convenienceFee: { type: Number, default: 0 },
  },

  // OTP Verification
  otp: {
    type: String,
    required: false,
  },

}, {
  timestamps: true,
});

BookingSchema.index({ "tracking.providerLocation": "2dsphere" });

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export default Booking;
