import { z } from 'zod';

export const APITokenSchema = z.object({
    name: z.string().min(1, { message: 'Token name is required' }),
    dataAccessLevel: z
        .array(z.string())
        .min(1, { message: 'At least one collection must be selected' }),
    actionAccessLevel: z
        .array(z.string())
        .min(1, { message: 'At least one access level must be selected' }),
});

export type TypeAPiTokenSchema = z.infer<typeof APITokenSchema>;

export const APIToken = z.object({
    name: z.string().min(1, { message: 'Token name is required' }),
    tableAccess: z.string().min(1, { message: 'Table name is required' }),
    actionAccessLevel: z
        .array(z.string())
        .min(1, { message: 'At least one access level must be selected' }),
});

export type TypeAPiToken = z.infer<typeof APIToken>;