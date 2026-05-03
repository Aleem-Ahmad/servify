import mongoose from 'mongoose';

const VerifyCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index to auto-delete expired codes
  }
});

export default mongoose.models.VerifyCode || mongoose.model('VerifyCode', VerifyCodeSchema);
