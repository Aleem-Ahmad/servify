import connectDB from './mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function seedAdmin() {
  await connectDB();
  
  const ownerEmail = "www.aleemahmadghias@gmail.com";
  const ownerPassword = "servify@2328";
  
  const existingAdmin = await User.findOne({ email: ownerEmail });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    await User.create({
      name: "Owner Admin",
      email: ownerEmail,
      password: hashedPassword,
      role: "admin",
      status: "Active",
      phone: "03000000000",
      district: "Okara",
      tehseel: "Okara",
      cnic: "00000-0000000-0",
    });
    console.log("Owner admin seeded successfully");
  }
}
