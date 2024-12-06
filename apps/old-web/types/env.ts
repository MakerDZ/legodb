import { z } from 'zod';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().min(1),
        NODE_ENV: z.string().optional(),
        GOOGLE_CLIENT_ID: z.string().min(1),
        HOST_NAME: z.string().min(1),
        GOOGLE_CLIENT_SECRET: z.string().min(1),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        HOST_NAME: process.env.HOST_NAME,
    },
});
