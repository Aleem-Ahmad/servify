import { z } from 'zod';

export const emailSchema = z.object({
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Only @gmail.com addresses are allowed"),
});

export const verifySchema = z.object({
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
});
