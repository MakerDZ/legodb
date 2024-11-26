import { QueryClient } from '@tanstack/react-query';
import { ColumnOrder, Database } from '@prisma/client';

export const useDatabaseCacheUpdate = (queryClient: QueryClient) => {
    const addDatabase = (newDatabase: Database) => {
        queryClient.setQueryData(['databaseData'], (data: Database[]) => {
            return [...data, newDatabase];
        });
    };

    const updateDatabase = (editedDatabase: Database) => {
        queryClient.setQueryData(['databaseData'], (data: Database[]) => {
            const updatedDatabase = data.map((data) => {
                if (data.id == editedDatabase.id) {
                    return editedDatabase;
                }
                return data;
            });
            return updatedDatabase;
        });
    };

    const deleteDatabase = (deletedDatabase: Database) => {
        queryClient.setQueryData(['databaseData'], (data: Database[]) => {
            const updatedDatabase = data.filter(
                (data) => data.id != deletedDatabase.id
            );
            return updatedDatabase;
        });
    };

    const addNewDatabaseColumn = (newDBColumn: ColumnOrder) => {
        queryClient.setQueryData(['databaseData'], (data: Database[]) => {
            const updatedDatabase = data.map((database: any) => {
                if (database.id === newDBColumn.databaseId) {
                    return {
                        ...database,
                        columnOrders: [...database.columnOrders, newDBColumn],
                    };
                }

                return database;
            });

            return updatedDatabase;
        });
    };

    const deleteDatabaseColumn = (columnToDelete: ColumnOrder) => {
        queryClient.setQueryData(
            ['databaseData'],
            (data: Database[] & { columnOrders: ColumnOrder[] }) => {
                const updatedDatabase = data.map((database: any) => {
                    if (database.id === columnToDelete.databaseId) {
                        return {
                            ...database,
                            columnOrders: database.columnOrders.filter(
                                (column: any) => column.id !== columnToDelete.id
                            ),
                        };
                    }
                    return database;
                });
                return updatedDatabase;
            }
        );
    };

    const updateDatabaseColumnName = (columnToUpdate: ColumnOrder) => {
        queryClient.setQueryData(['databaseData'], (data: Database[]) => {
            const updatedDatabase = data.map((database: any) => {
                if (database.id === columnToUpdate.databaseId) {
                    return {
                        ...database,
                        columnOrders: database.columnOrders.map(
                            (column: any) =>
                                column.id === columnToUpdate.id
                                    ? { ...column, name: columnToUpdate.name }
                                    : column
                        ),
                    };
                }
                return database;
            });
            return updatedDatabase;
        });
    };

    return {
        addDatabase,
        updateDatabase,
        deleteDatabase,
        addNewDatabaseColumn,
        deleteDatabaseColumn,
        updateDatabaseColumnName,
    };
};
