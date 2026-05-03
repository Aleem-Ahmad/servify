import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: function() {
      // Password is only required for credentials login, not for OAuth (Google)
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  verifyCode: {
    type: String,
    required: [true, "Verify Code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify Code Expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
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
  messages: [MessageSchema],
  
  // Servify Specific Fields
  phone: String,
  district: String,
  tehseel: String,
  cnic: String,
  address: String,
  gender: String,
  religion: String,
  maritalStatus: String,
  dob: String,
  category: String,
  experience: String,
  providerType: String,
  image: String,
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
