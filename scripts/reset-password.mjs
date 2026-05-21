import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

const prisma = new PrismaClient();
const email = normalizeEmail(process.argv[2] || 'www.aleemahmadghias@gmail.com');
const password = process.argv[3] || 'Aa@123';

const hashed = await bcrypt.hash(password, 10);
const user = await prisma.user.findFirst({
  where: { email: { equals: email, mode: 'insensitive' } },
});

if (!user) {
  console.log('User not found:', email);
  process.exit(1);
}

await prisma.user.update({
  where: { id: user.id },
  data: {
    password: hashed,
    isVerified: true,
    role: 'admin',
    status: 'Active',
  },
});

const ok = await bcrypt.compare(password, hashed);
console.log('Updated:', email, '| role: admin | password match:', ok);
await prisma.$disconnect();
