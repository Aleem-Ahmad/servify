import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  name: { type: String, required: [true, "Name is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
  },
  googleId: { type: String, unique: true, sparse: true },
  
  // Verification & Security
  verifyCode: { type: String, required: true },
  verifyCodeExpiry: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  
  // Documents (CNIC, Skill Demo, etc.)
  documents: {
    cnicFront: String, // URL to image
    cnicBack: String,  // URL to image
    skillDemo: String, // URL to video or portfolio
    addressProof: String, // URL to document
  },

  // Role & Status
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer',
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Blocked'],
    default: 'Active',
  },
  surveyDate: { type: Date },
  warning: { type: String, default: "" },

  // Trust Score & Performance (For Providers)
  trustScore: { type: Number, default: 0 }, // 0 to 100
  badge: {
    type: String,
    enum: ['Basic', 'Pro', 'Elite'],
    default: 'Basic',
  },
  performance: {
    rating: { type: Number, default: 5.0 },
    completedJobs: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }, // in minutes
    complaintHistory: { type: Number, default: 0 }, // count of valid complaints
    leaderboardPoints: { type: Number, default: 0 }, // weekly points
  },

  // Live Tracking & Availability
  isOnline: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
  },

  // Subscriptions & Monetization
  subscription: {
    plan: { type: String, enum: ['Free', 'Silver', 'Gold'], default: 'Free' },
    expiryDate: Date,
  },

  // AI & Messaging
  messages: [MessageSchema],
  
  // Additional Servify Info
  phone: String,
  district: String,
  tehseel: String,
  cnic: String,
  address: String,
  gender: String,
  dob: String,
  category: String,
  experience: String,
  providerType: String,
  image: String,
}, {
  timestamps: true,
});

// Create index for geo-spatial queries (Smart Matching)
UserSchema.index({ location: "2dsphere" });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
