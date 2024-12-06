'use server';
import {
    createCollectionData,
    deleteCollection,
    getCollection,
    getCollections,
    UpdateCollection,
} from '@/data-access/collection';
import { UnauthorizedError } from '@/entities/errors/auth';
import { Restrictet } from '@/utils/handler';
import { $Enums } from '@prisma/client';
import { User } from 'lucia';

export interface Iauth {
    user: User;
    role: $Enums.Role | undefined;
}

export async function createCollectionUseCase(name: string, authUser: Iauth) {
    await Restrictet(authUser.role);
    const collection = await createCollectionData(name);

    return collection;
}

export async function getCollectionsUseCase() {
    const collectionList = await getCollections();

    return collectionList;
}

export async function getCollectionUseCase(id: string) {
    const collection = await getCollection(id);

    return collection;
}

export async function deleteCollectionUseCase(id: string) {
    const deletedCollection = await deleteCollection(id);

    return deletedCollection;
}

export async function updateCollectionUseCase(
    input: {
        id: string;
        name: string;
    },
    authuser: Iauth
) {
    Restrictet(authuser.role);
    const updatedCollection = await UpdateCollection(input);

    return updatedCollection;
}
