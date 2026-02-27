import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().optional(),
    birthDate: z.string().optional(),
    companyName: z.string().optional(),
    extraInfo: z.string().optional(), // For flexibility
    role: z.enum(['user', 'producer', 'consumer']).default('consumer')
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    role: z.string().optional()
});

export const forgotPasswordSchema = z.object({
    email: z.string().email()
});

export const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
});

export const verifyEmailSchema = z.object({
    token: z.string()
});
