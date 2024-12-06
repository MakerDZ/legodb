import z from 'zod';

export const WebHook = z.object({
    name: z.string().min(1, { message: 'Token name is required' }),
    webUrl: z.string().min(1, { message: 'weburl  is required' }),
    tableAccess: z.string().min(1, { message: 'Table name is required' }),
});

export type TypeWebHook = z.infer<typeof WebHook>;
