const fs = require('fs');
if (fs.existsSync('.env.local')) {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
  });
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting phone number migration...');
  
  const users = await prisma.user.findMany({
    where: {
      phone: {
        not: null
      }
    }
  });

  let updatedCount = 0;

  for (const user of users) {
    let phone = user.phone;
    // Current format is likely exactly 10 digits "3xxxxxxxxx"
    if (/^[1-9]\d{9}$/.test(phone)) {
      const formatted = `+92-${phone.slice(0, 3)}-${phone.slice(3)}`;
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: formatted }
      });
      updatedCount++;
      console.log(`Updated user ${user.id}: ${phone} -> ${formatted}`);
    } else if (phone && !phone.startsWith('+92')) {
       // Just in case there are others that missed validation
       const cleaned = phone.replace(/\D/g, '');
       if (cleaned.length === 10) {
         const formatted = `+92-${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
         await prisma.user.update({
           where: { id: user.id },
           data: { phone: formatted }
         });
         updatedCount++;
         console.log(`Updated user ${user.id}: ${phone} -> ${formatted}`);
       } else if (cleaned.length === 12 && cleaned.startsWith('92')) {
         const formatted = `+92-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
         await prisma.user.update({
           where: { id: user.id },
           data: { phone: formatted }
         });
         updatedCount++;
         console.log(`Updated user ${user.id}: ${phone} -> ${formatted}`);
       }
    }
  }

  console.log(`Migration complete! Updated ${updatedCount} user(s).`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
