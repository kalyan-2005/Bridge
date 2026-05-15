import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[0-9]/, "Include a number"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
