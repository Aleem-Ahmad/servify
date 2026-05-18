require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const email = 'www.aleemahmadghias+customer@gmail.com'; // Using +customer alias to bypass unique email constraint
  const pass = 'Aa@123';
  const hashed = await bcrypt.hash(pass, 10);
  
  await User.updateOne(
    { email },
    {
      $set: {
        email,
        password: hashed,
        role: 'customer',
        isVerified: true,
        phone: '03214703384',
        name: 'Aleem Customer',
        username: 'aleem_customer',
        status: 'Active'
      }
    },
    { upsert: true }
  );
  console.log('Customer account created successfully.');
  process.exit(0);
});
