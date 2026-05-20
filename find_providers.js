require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find({}, 'email role name category status isVerified');
  console.log("USERS_LIST:", JSON.stringify(users, null, 2));
  process.exit(0);
}).catch(err => {
  console.error("DB connection error:", err);
  process.exit(1);
});
