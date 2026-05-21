import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name`;
  console.log('Tables:', tables);

  const counts = {
    User: await prisma.user.count(),
    Booking: await prisma.booking.count(),
    Review: await prisma.review.count(),
    VerifyCode: await prisma.verifyCode.count(),
  };
  console.log('Row counts:', counts);
} catch (e) {
  console.error('DB check failed:', e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
