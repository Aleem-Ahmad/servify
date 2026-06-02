export async function createUniqueUsername(prisma, email, fallbackName = "user") {
  const localPart = typeof email === "string" ? email.split("@")[0] : "";
  const base = slugify(localPart || fallbackName) || "user";

  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? base : `${base}${index + 1}`;
    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) return candidate;
  }

  return `${base}${Date.now().toString(36)}`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}
