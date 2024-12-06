import { z } from 'zod';
export const createRoleSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    role: z.enum(['God', 'Entry'], {
        message: 'Role must be either God or Entry',
    }),
});

export type TypeRoleSchema = z.infer<typeof createRoleSchema>;
