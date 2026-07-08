import { z } from "zod";

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username must be at most 50 characters long"),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long"),
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username must be at most 50 characters long")
    .optional(),
  gender: z
    .enum(["Male", "Female", "Other"], "Gender must be either Male, Female, or Other")
    .optional(),
});

export const ChangePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(8, "Old password must be at least 8 characters long")
    .max(100, "Old password must be at most 100 characters long"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long")
    .max(100, "New password must be at most 100 characters long"),
});
