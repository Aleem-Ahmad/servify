import connectDB from './mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function seedAdmin() {
  await connectDB();
  
  const ownerEmail = "www.aleemahmadghias@gmail.com";
  const ownerPassword = "admin_servify";
  
  const existingAdmin = await User.findOne({ email: ownerEmail });
  const hashedPassword = await bcrypt.hash(ownerPassword, 10);
  
  if (!existingAdmin) {
    await User.create({
      name: "Owner Admin",
      username: "owner_admin",
      email: ownerEmail,
      password: hashedPassword,
      role: "admin",
      status: "Active",
      phone: "03214703384",
      district: "Okara",
      tehseel: "Okara",
      cnic: "00000-0000000-0",
      verifyCode: "000000",
      verifyCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isVerified: true
    });
    console.log("Owner admin seeded successfully");
  } else {
    // Force update password and phone in case they were wrong
    await User.updateOne({ email: ownerEmail }, {
      password: hashedPassword,
      phone: "03214703384",
      isVerified: true
    });
    console.log("Owner admin updated successfully");
  }
}
