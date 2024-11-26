import { prisma } from '@/lib/prisma';
import { TypeAPiTokenSchema } from '@/validation/API-Token';

export async function createApiToken(input: TypeAPiTokenSchema, token: string) {
    try {
        const apiToken = await prisma.godAccessToken.create({
            data: {
                name: input.name,
                token: token,
                dataAccessLevel: input.dataAccessLevel,
                actionAccessLevel: input.actionAccessLevel,
            },
        });
        return apiToken;
    } catch (error) {
        console.error('Error creating API token:', error);
        throw new Error('Could not create API token');
    }
}

export async function getGodToken(token: string) {
    const access = await prisma.godAccessToken.findUnique({
        where: { token },
    });

    return access;
}

export async function getApiTokens() {
    try {
        const apitokenList = await prisma.godAccessToken.findMany();
        return apitokenList;
    } catch (error) {
        throw new Error('Failed to fetch api-token-list');
    }
}

export async function deleteApiToken(token: string) {
    try {
        return await prisma.godAccessToken.delete({
            where: {
                token: token,
            },
        });
    } catch (error) {
        throw new Error('Failed to delete api');
    }
}