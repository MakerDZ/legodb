import { z } from 'zod';

export const createDatabase = z.object({
    name: z
        .string()
        .nonempty('database name is required')
        .regex(
            /^[A-Za-z_]+$/,
            'database name must contain only letters and underscores, no spaces or special characters'
        ),
});

export type TypeDatabaseCreateSchema = z.infer<typeof createDatabase>;

/* =============== Database Column Creation Validation =============== */


const PropertyType = [
    'Text',
    'Attachment',
    'RichText',
    'Number',
    'Boolean',
    'Tags',
    'Calendar',
    'Relation',
] as const;

export const createDatabaseColumn = z.object({
    name: z
        .string()
        .regex(
            /^[A-Za-z_]+$/,
            'database name must contain only letters and underscores, no spaces or special characters'
        ),
    type: z.enum(PropertyType),
    relationLink: z.union([
        z.object({
            databaseID: z.string(),
            datbaseName: z.string(),
            columnID: z.string(),
            columnName: z.string(),
            type: z.enum(['one_to_one', 'one_to_many']),
        }),
        z.null(),
    ]),
});

export type TypeCreateDatabaseColumn = z.infer<typeof createDatabaseColumn>