import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Standalone, robust parser for Next.js environment files (.env.local / .env)
try {
  const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && !key.startsWith('#')) {
          process.env[key] = value;
        }
      }
    });
    console.log(`Loaded environment configuration from ${envPath}`);
  }
} catch (e) {
  console.warn('Failed to load environment variables manually', e);
}

const prisma = new PrismaClient();

async function seedAdmins() {
  const admins = [
    {
      name: 'Owner Admin',
      username: 'owner_admin',
      email: 'www.aleemahmadghias@gmail.com',
      password: '381A',
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
    {
      name: 'Assistant Admin',
      username: 'assistant_admin',
      email: 'servifyosm@gmail.com',
      password: 'admin_servify',
      role: 'admin',
      status: 'Active',
      phone: '03001234567',
      district: 'System',
      tehseel: 'System',
      cnic: '11111-1111111-1',
      verifyCode: '000000',
      verifyCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isVerified: true,
    }
  ];

  for (const admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const existingAdmin = await prisma.user.findUnique({ where: { email: admin.email } });

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          ...admin,
          password: hashedPassword,
        },
      });
      console.log(`${admin.name} seeded successfully`);
    } else {
      await prisma.user.update({
        where: { email: admin.email },
        data: {
          name: admin.name,
          username: admin.username,
          password: hashedPassword,
          role: 'admin',
          status: 'Active',
          isVerified: true,
        },
      });
      console.log(`${admin.name} updated successfully`);
    }
  }
}

try {
  await seedAdmins();
} catch (e) {
  console.error('Seed failed:', e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
