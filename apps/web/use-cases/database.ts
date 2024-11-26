'use server';

import { getCollectionByName } from '@/data-access/collection';
import {
    createDatabase,
    createDatabaseColumn,
    getCollectionDatabase,
    getDatabase,
} from '@/data-access/database';

export async function createDatabaseUseCase(
    name: string,
    collectionName: string
) {
    const collection = await getCollectionByName(collectionName);
    if (collection) {
        const database = await createDatabase(name, collection?.id);
        return database;
    }

    return null;
}

export async function getDatabaseUseCase() {
    const databaseList = await getDatabase();
    return databaseList;
}

export async function getCollectionDatabases(collectionName: string) {
    const collectionDBList = await getCollectionDatabase(collectionName);

    return collectionDBList;
}

export async function createDatabaseColumnUseCase(
    name: string,
    type: string,
    databaseId: string,
    relationLink: {
        databaseID: string;
        datbaseName: string;
        columnID: string;
        columnName: string;
    } | null
) {
    return await createDatabaseColumn(name, type, databaseId, relationLink);
}