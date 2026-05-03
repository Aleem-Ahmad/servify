import { z } from 'zod';

export const signupSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_]{3,20}$/, "Username must be 3-20 characters and can only contain letters, numbers, and underscores"),
  name: z.string().regex(/^[a-zA-Z\s]{3,30}$/, "Name must be 3-30 alphabetic characters"),
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Only @gmail.com addresses are allowed"),
  password: z.string().regex(/^(?=.*[a-zA-Z])(?=.*\d).{6,}$/, "Password must be at least 6 characters and contain both letters and numbers"),
  role: z.enum(['customer', 'provider']),
  phone: z.string().regex(/^[1-9]\d{9}$/, "Phone must be exactly 10 digits without a leading zero"),
  district: z.string().regex(/^[a-zA-Z\s]{3,20}$/, "District must be 3-20 alphabetic characters"),
  tehseel: z.string().regex(/^[a-zA-Z\s]{3,20}$/, "Tehseel must be 3-20 alphabetic characters"),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, "Invalid CNIC format (xxxxx-xxxxxxx-x)"),
  address: z.string().regex(/^.{5,100}$/, "Address must be 5-100 characters").optional().or(z.literal("")),
  gender: z.string().regex(/^(Male|Female|Other)$/, "Select valid gender").optional().or(z.literal("")),
  religion: z.string().regex(/^[a-zA-Z\s]{3,15}$/, "Invalid Religion").optional().or(z.literal("")),
  maritalStatus: z.string().regex(/^(Single|Married)$/, "Select marital status").optional().or(z.literal("")),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid Date format (YYYY-MM-DD)").optional().or(z.literal("")),
  category: z.string().optional(),
  experience: z.string().optional(),
  providerType: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'provider') {
    if (!data.category || data.category.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Service category is required for providers",
        path: ["category"],
      });
    } else if (!/^[a-zA-Z\s]{3,30}$/.test(data.category)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid category format",
        path: ["category"],
      });
    }

    if (!data.experience || data.experience.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Professional details/experience are required for providers",
        path: ["experience"],
      });
    } else if (!/^.{10,500}$/.test(data.experience)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Experience details must be between 10-500 characters",
        path: ["experience"],
      });
    }
  }
});
