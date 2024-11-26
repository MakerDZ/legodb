'use server';

import { prisma } from '@/lib/prisma';
import { ColumnOrder } from '@prisma/client';

export const createDatabase = async (name: string, collectionID: string) => {
    try {
        const database = await prisma.database.create({
            data: {
                name: name,
                collection: {
                    connect: {
                        id: collectionID,
                    },
                },
                columnOrders: {
                    create: [
                        {
                            name: 'No',
                            type: 'Number',
                            order: 0,
                            deafult: true,
                        },
                    ],
                },
            },
            include: {
                columnOrders: true,
            },
        });

        return database;
    } catch (err) {
        console.log(
            'Error while creating new database with column order: ' + err
        );
        throw new Error('Failed to create new database.');
    }
};

export const getDatabase = async () => {
    try {
        const databaseList = await prisma.database.findMany({
            include: { columnOrders: true },
        });
        return databaseList;
    } catch (err) {
        console.log('Error fetching database:', err);
        throw new Error('Failed to fetch database');
    }
};

export const getDatabaseWithRow = async (id: string, name: string) => {
    try {
        const databaseRowList = await prisma.rowOrder.findMany({
            where: {
                databaseId: id,
                rowData: {
                    some: {
                        name: name,
                    },
                },
            },
            include: {
                rowData: true,
            },
        });

        // Filter the rows to only include those where rowData has a name matching the provided name
        const filteredRows = databaseRowList.flatMap((row) => {
            return row.rowData.filter((data) => data.name === name);
        });

        return filteredRows;
    } catch (err) {
        console.log('Error fetching databases with row', err);
        throw new Error('Failed to fetch database');
    }
};

export const getCollectionDatabase = async (collectionName: string) => {
    try {
        const dbColList = await prisma.database.findMany({
            where: {
                collection: {
                    name: collectionName,
                },
            },
            include: { columnOrders: true },
        });

        return dbColList;
    } catch (err) {
        console.log('Error fetching database:', err);
        throw new Error('Failed to fetch database');
    }
};

export const deleteDatabase = async (databaseID: string) => {
    try {
        const database = await prisma.database.delete({
            where: {
                id: databaseID,
            },
        });

        await prisma.tableAccessToken.deleteMany({
            where: {
                tableAccess: database.name,
            },
        });
        
        return database;
    } catch (err) {
        console.log('Error deleting database:', err);
        throw new Error('Failed to delete database');
    }
};

export const renameDatbase = async (datbaseID: string, newName: string) => {
    try {
        const renamedDatabase = await prisma.database.update({
            where: {
                id: datbaseID,
            },
            data: {
                name: newName,
            },
            include: {
                columnOrders: true,
            },
        });
        return renamedDatabase;
    } catch (err) {
        console.log('Error renaming database:', err);
        throw new Error('Failed to rename database.');
    }
};

export const createDatabaseColumn = async (
    name: string,
    type: string,
    databaseId: string,
    relationLink: {
        databaseID: string;
        datbaseName: string;
        columnID: string;
        columnName: string;
    } | null
) => {
    try {
        const columnCount = await prisma.columnOrder.count({
            where: {
                databaseId,
            },
        });
        const newDatabaseColumn = await prisma.columnOrder.create({
            data: {
                databaseId,
                name,
                type,
                relationLink,
                deafult: false,
                order: columnCount,
            },
        });
        return newDatabaseColumn;
    } catch (err) {
        console.log('Error creating database column:', err);
        throw new Error('Failed to create database column.');
    }
};

// export const deleteDatabaseColumn = async (id: string) => {
//     try {
//         const databaseColumn = await prisma.columnOrder.delete({
//             where: {
//                 id,
//             },
//         });
//         return databaseColumn;
//     } catch (err) {
//         console.log('Error deleting database column:', err);
//         throw new Error('Failed to delete database column');
//     }
// };

export async function deleteColumnOrderAndAssociatedRowData(
    databaseId: string,
    columnOrderId: string,
    columnOrderName: string
): Promise<ColumnOrder | null> {
    let deletedColumnOrder: ColumnOrder | null | any = null;

    console.log(
        `Deleting ColumnOrder with ID ${columnOrderId} from Database ${databaseId}`
    );

    try {
        await prisma.$transaction(async (prisma) => {
            // Step 1: Find the Database using databaseId
            const database = await prisma.database.findUnique({
                where: { id: databaseId }, // Ensure databaseId is valid
                include: {
                    columnOrders: true,
                    rowOrders: {
                        include: { rowData: true },
                    },
                },
            });

            if (!database) {
                throw new Error(`Database with ID ${databaseId} not found`);
            }

            // Step 2: Find the specified ColumnOrder
            const columnOrder = database.columnOrders.find(
                (column) => column.id === columnOrderId
            );

            if (!columnOrder) {
                console.error(
                    `ColumnOrder with ID ${columnOrderId} not found in Database ${databaseId}`
                );
                return null; // Early exit if no column order found
            }

            // Step 3: Attempt to delete the specified ColumnOrder
            try {
                const deletedOrder = await prisma.columnOrder.delete({
                    where: { id: columnOrderId },
                });
                deletedColumnOrder = deletedOrder;
                console.log(`Deleted ColumnOrder with ID ${deletedOrder.id}`);
            } catch (deleteError) {
                console.error(
                    `Failed to delete ColumnOrder with ID ${columnOrderId}:`,
                    deleteError
                );
                throw new Error(
                    `Deletion failed for ColumnOrder ID ${columnOrderId}`
                );
            }

            // Step 4: Delete all RowData entries associated with the column order
            for (const rowOrder of database.rowOrders) {
                try {
                    const deletedRowData = await prisma.rowData.deleteMany({
                        where: {
                            rowOrderId: rowOrder.id,
                            name: columnOrderName,
                        },
                    });
                    console.log(
                        `Deleted RowData for RowOrder ID ${rowOrder.id}:`,
                        deletedRowData.count
                    );
                } catch (rowDataError) {
                    console.error(
                        `Failed to delete RowData for RowOrder ID ${rowOrder.id}:`,
                        rowDataError
                    );
                }
            }
        });

        console.log('ColumnOrder and associated RowData deleted successfully');
    } catch (error) {
        console.error('Error during transaction:', error);
    } finally {
        await prisma.$disconnect();
    }

    console.log(deletedColumnOrder);

    return deletedColumnOrder;
}



export const renameDatabaseColumn = async (id: string, newName: string) => {
    try {
        const renamedDatabaseColumn = await prisma.columnOrder.update({
            where: {
                id,
            },
            data: {
                name: newName,
            },
        });
        return renamedDatabaseColumn;
    } catch (err) {
        console.log('Error renaming database column:', err);
        throw new Error('Failed to rename database column.');
    }
};

export const updateDatabaseColumnOrder = async (columns: ColumnOrder[]) => {
    try {
        const updatePromises = columns.map((column) =>
            prisma.columnOrder.update({
                where: { id: column.id },
                data: { order: column.order },
            })
        );

        await Promise.all(updatePromises);
        return columns;
    } catch (err) {
        console.log('Error sorting database column:', err);
        throw new Error('Failed to sort database column.');
    }
};
