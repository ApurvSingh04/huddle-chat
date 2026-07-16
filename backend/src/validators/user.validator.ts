import { z } from "zod";

export const updateAvatarSchema = z.object({
    avatar: z.string().nullable(),
});

export type UpdateAvatarSchemaType = z.infer<typeof updateAvatarSchema>;
