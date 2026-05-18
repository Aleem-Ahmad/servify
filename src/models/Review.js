import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  mediaUrls: [{ type: String }], // photos / videos / audio base64 or upload paths
  isFlagged: { type: Boolean, default: false },
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export default Review;
