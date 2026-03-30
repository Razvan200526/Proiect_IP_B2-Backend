import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    image: z.string().url().optional(),
});

export const updateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    image: z.string().url().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update."
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;