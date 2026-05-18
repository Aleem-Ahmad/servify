require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const email = 'www.aleemahmadghias@gmail.com';
  const pass = 'admin_servify';
  const hashed = await bcrypt.hash(pass, 10);
  
  await User.updateOne(
    { email },
    {
      $set: {
        email,
        password: hashed,
        role: 'admin',
        isVerified: true,
        phone: '03214703384',
        name: 'Owner Admin',
        username: 'owner_admin'
      }
    },
    { upsert: true }
  );
  console.log('Done');
  process.exit(0);
});
