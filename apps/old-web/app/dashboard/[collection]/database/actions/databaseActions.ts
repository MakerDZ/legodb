'use server';

import {
    deleteColumnOrderAndAssociatedRowData,
    deleteDatabase,
    renameDatabaseColumn,
    renameDatbase,
    updateDatabaseColumnOrder,
} from '@/data-access/database';
import { actionClient } from '@/lib/safe-action';
import {
    createDatabaseColumnUseCase,
    createDatabaseUseCase,
} from '@/use-cases/database';
import { createDatabase, createDatabaseColumn } from '@/validation/database';
import { ColumnOrder } from '@prisma/client';
import { z } from 'zod';

export const createDatabaseAction = actionClient
    .schema(
        createDatabase.extend({
            collectionName: z.string(),
        })
    )
    .action(async ({ parsedInput: { name, collectionName } }) => {
        const database = await createDatabaseUseCase(name, collectionName);

        if (database) {
            return {
                data: database,
                status: 'success',
            };
        }

        return {
            data: null,
            status: 'failed',
        };
    });

export const deleteDatabaseAction = async (databaseId: string) => {
    return await deleteDatabase(databaseId);
};

export const updateDatabaseNameAction = async (
    databaseId: string,
    newName: string
) => {
    return await renameDatbase(databaseId, newName);
};

export const createDatabaseColumnAction = actionClient
    .schema(
        createDatabaseColumn.extend({
            databaseID: z.string(),
        })
    )
    .action(
        async ({ parsedInput: { name, type, databaseID, relationLink } }) => {
            const newDatabaseColumn = await createDatabaseColumnUseCase(
                name,
                type,
                databaseID,
                relationLink
            );

            if (newDatabaseColumn) {
                return {
                    data: newDatabaseColumn,
                    status: 'success',
                };
            }

            return {
                data: null,
                status: 'failed',
            };
        }
    );

// export const deleteDatabaseColumnAction = async (databaseColumnId: string) => {
//     return await deleteDatabaseColumn(databaseColumnId);
// };

export const deleteDatabaseColumnAction = async (
    databaseId: string,
    columnOrderId: string,
    columnOrderName: string
) => {
    return await deleteColumnOrderAndAssociatedRowData(
        databaseId,
        columnOrderId,
        columnOrderName
    );
};



export const updateDatabaseColumnNameAction = async (
    databaseColumnId: string,
    newName: string
) => {
    return await renameDatabaseColumn(databaseColumnId, newName);
};

export const updateDatabaseColumnOrderAction = async (
    databaseColumns: ColumnOrder[]
) => {
    return await updateDatabaseColumnOrder(databaseColumns);
};