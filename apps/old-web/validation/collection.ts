import { z } from 'zod';
export const createCollection = z.object({
    name: z
        .string()
        .nonempty('collection name is required')
        .regex(
            /^[A-Za-z_]+$/,
            'collection name must contain only letters and underscores, no spaces or special characters'
        ),
});

export const updateCollectionSchema = createCollection.extend({
    id: z.string(),
});

export type TypeCollectionSchema = z.infer<typeof createCollection>;
