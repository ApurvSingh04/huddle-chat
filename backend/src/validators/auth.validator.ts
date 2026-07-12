import {z} from "zod"


export const emailSchema = z.string().trim().email("Invalid Email Address").min(1);


export const passwordSchema = z.string().min(6)

export const nameSchema = z.string().min(1)

export const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    avatar: z.string().optional()
});


export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginType = z.infer<typeof loginSchema>;    