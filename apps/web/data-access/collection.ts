import { prisma } from '@/lib/prisma';

export const createCollectionData = async (name: string) => {
    const collection = await prisma.collection.create({
        data: {
            name: name,
        },
    });

    return collection;
};
export async function getCollections() {
    try {
        const collectionlist = await prisma.collection.findMany();
        return collectionlist;
    } catch (error) {
        throw new Error('Failed to fetch collections');
    }
}

export async function getCollection(id: string) {
    try {
        return await prisma.collection.findFirst({
            where: {
                id: id,
            },
        });
    } catch (error) {
        throw new Error('Failed to fetch collection');
    }
}

export async function UpdateCollection(input: { id: string; name: string }) {
    try {
        return await prisma.collection.update({
            where: {
                id: input.id,
            },
            data: {
                name: input.name,
            },
        });
    } catch (error) {
        console.error('Error updating collection:', error);
        throw new Error('Failed to update collection');
    }
}

export async function deleteCollection(id: string) {
    try {
        return await prisma.collection.delete({
            where: {
                id: id,
            },
        });
    } catch (error) {
        throw new Error('Failed to delete collection');
    }
}

export async function getCollectionByName(name: string) {
    try {
        return await prisma.collection.findUnique({
            where: {
                name,
            },
        });
    } catch (error) {
        console.error('Error fetching collection by name:', error);
        throw new Error('Failed to fetch collection by name');
    }
}