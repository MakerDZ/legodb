import { prisma } from '@/lib/prisma';
import { TypeAPiToken } from '@/validation/API-Token';

export async function createApi(input: TypeAPiToken, token: string) {
    try {
        const api = await prisma.tableAccessToken.create({
            data: {
                name: input.name,
                token: token,
                tableAccess: input.tableAccess,
                actionAccessLevel: input.actionAccessLevel,
            },
        });

        return api;
    } catch (error) {
        console.error('Error creating API token:', error);
        throw new Error('Could not create API token');
    }
}

export async function getApi() {
    try {
        const apiList = await prisma.tableAccessToken.findMany();
        return apiList;
    } catch (error) {
        throw new Error('Failed to fetch api lists');
    }
}

export async function deleteApi(token: string) {
    try {
        return await prisma.tableAccessToken.delete({
            where: {
                token: token,
            },
        });
    } catch (error) {
        throw new Error('Failed to delete api');
    }
}