import { normalizeEmail } from '@/lib/normalizeEmail';

export async function findUserByEmail(prisma, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  return prisma.user.findFirst({
    where: {
      email: { equals: normalized, mode: 'insensitive' },
    },
  });
}
