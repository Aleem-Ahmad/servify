import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function seedAdmin() {
  const ownerEmail = "www.aleemahmadghias@gmail.com";
  const ownerPassword = "admin_servify";
  
  const existingAdmin = await prisma.user.findUnique({ where: { email: ownerEmail } });
  const hashedPassword = await bcrypt.hash(ownerPassword, 10);
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
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
      }
    });
    console.log("Owner admin seeded successfully");
  } else {
    // Force update password and phone in case they were wrong
    await prisma.user.update({
      where: { email: ownerEmail },
      data: {
        password: hashedPassword,
        phone: "03214703384",
        isVerified: true
      }
    });
    console.log("Owner admin updated successfully");
  }
}
