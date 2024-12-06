import { z } from 'zod';

import crypto from 'crypto';
import { ColumnOrder } from '@/app/dashboard/[collection]/dashboard/components/CreateTableRowModal';
import { EnrichedRowData } from '@/types/dashboard/nav';

export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export const generateSchema = (columnOrders: ColumnOrder[]) => {
    const schemaObject: Record<string, any> = {};

    columnOrders.forEach((column) => {
        if (column.name === 'No') return;

        switch (column.type) {
            case 'Number':
                schemaObject[column.name] = z.number().min(0, {
                    message: `${column.name} must be a positive number`,
                });
                break;

            case 'Text':
            case 'RichText':
                schemaObject[column.name] = z
                    .string()
                    .min(1, { message: `${column.name} cannot be empty` });
                break;

            case 'Boolean':
                schemaObject[column.name] = z
                    .string()
                    .min(1, { message: `${column.name} cannot be empty` });
                break;

            case 'Calendar':
                schemaObject[column.name] = z
                    .string()
                    .min(1, { message: `${column.name} must be a valid date` });
                break;

            // case 'Relation':
            //     if (column.relationLink?.type === 'one_to_many') {
            //         schemaObject[column.name] = z.array(z.string()).min(1, {
            //             message: `At least one item must be selected for ${column.name}`,
            //         });
            //     } else {
            //         schemaObject[column.name] = z
            //             .string()
            //             .min(1, { message: `${column.name} cannot be empty` });
            //     }
            //     break;

            case 'Relation':
                schemaObject[column.name] = z
                    .array(
                        z.object({
                            rowID: z.string(),
                            selectedValue: z.string(),
                        })
                    )
                    .min(1, {
                        message: `At least one item must be selected for ${column.name}`,
                    });
                break;

            case 'Tags':
                schemaObject[column.name] = z.array(z.string()).nonempty({
                    message: `${column.name} must contain at least one tag`,
                });
                break;

            default:
                schemaObject[column.name] = z.any().optional();
        }
    });

    return z.object(schemaObject);
};

export const generateSchemaForEdit = (columnOrders: EnrichedRowData[]) => {
    const schemaObject: Record<string, any> = {};

    columnOrders.forEach((column) => {
        if (column.name === 'No') return;

        switch (column.type) {
            case 'Number':
                schemaObject[column.name] = z.number().min(0, {
                    message: `${column.name} must be a positive number`,
                });
                break;

            case 'Text':
            case 'RichText':
                schemaObject[column.name] = z
                    .string()
                    .min(1, { message: `${column.name} cannot be empty` });
                break;

            case 'Boolean':
                schemaObject[column.name] = z
                    .string()
                    .min(1, { message: `${column.name} cannot be empty` });
                break;

            case 'Calendar':
                schemaObject[column.name] = z
                    .string()
                    .min(1, { message: `${column.name} must be a valid date` });
                break;

            case 'Relation':
                schemaObject[column.name] = z
                    .array(
                        z.object({
                            rowID: z.string(),
                            selectedValue: z.string(),
                        })
                    )
                    .min(1, {
                        message: `At least one item must be selected for ${column.name}`,
                    });
                break;

            case 'Tags':
                schemaObject[column.name] = z.array(z.string()).nonempty({
                    message: `${column.name} must contain at least one tag`,
                });
                break;

            default:
                schemaObject[column.name] = z.any().optional();
        }
    });

    return z.object(schemaObject);
};
