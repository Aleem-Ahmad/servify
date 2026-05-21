import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const ownerEmail = process.env.ADMIN_EMAIL || 'www.aleemahmadghias@gmail.com';
  const ownerPassword = process.env.ADMIN_PASSWORD || 'Aa@123';
  const hashedPassword = await bcrypt.hash(ownerPassword, 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email: ownerEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Owner Admin',
        username: 'owner_admin',
        email: ownerEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'Active',
        phone: '03214703384',
        district: 'Okara',
        tehseel: 'Okara',
        cnic: '00000-0000000-0',
        verifyCode: '000000',
        verifyCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isVerified: true,
      },
    });
    console.log('Owner admin seeded successfully');
  } else {
    await prisma.user.update({
      where: { email: ownerEmail },
      data: {
        password: hashedPassword,
        role: 'admin',
        status: 'Active',
        phone: '03214703384',
        isVerified: true,
      },
    });
    console.log('Owner admin updated successfully');
  }
}

try {
  await seedAdmin();
} catch (e) {
  console.error('Seed failed:', e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
