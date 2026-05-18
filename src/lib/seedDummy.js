import User from "@/models/User";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb";

export async function seedDummyAccounts() {
  await connectDB();

  const accounts = [
    {
      username: "dummy_customer",
      name: "Dummy Customer",
      email: "gmaildummy@gmail.com",
      password: "12345",
      role: "customer",
      isVerified: true,
      verifyCode: "111111",
      verifyCodeExpiry: new Date(Date.now() + 3600000),
      status: "Active"
    },
    {
      username: "dummy_provider",
      name: "Dummy Provider",
      email: "provider.dummy@gmail.com", // Slightly changed to allow unique index
      password: "54321",
      role: "provider",
      isVerified: true,
      verifyCode: "222222",
      verifyCodeExpiry: new Date(Date.now() + 3600000),
      status: "Active",
      category: "Electrician",
      trustScore: 85,
      badge: "Pro"
    },
    {
      username: "dummy_admin",
      name: "Dummy Admin",
      email: "admin.dummy@gmail.com", // Slightly changed to allow unique index
      password: "servifyadmin",
      role: "admin",
      isVerified: true,
      verifyCode: "333333",
      verifyCodeExpiry: new Date(Date.now() + 3600000),
      status: "Active"
    }
  ];

  for (const account of accounts) {
    const hashedPassword = await bcrypt.hash(account.password, 10);
    
    await User.findOneAndUpdate(
      { email: account.email },
      { 
        $set: { 
          ...account, 
          password: hashedPassword,
          isVerified: true,
          status: "Active"
        } 
      },
      { upsert: true, new: true }
    );
    console.log(`Synced ${account.role} account: ${account.email}`);
  }
}
