import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { UserId } from '@/use-cases/types';

export async function createProfile(
    userId: string,
    displayName: string,
    image?: string
) {
    try {
        const profile = await prisma.profile.create({
            data: {
                userId: userId,
                displayName: displayName,
                image: image,
            },
        });

        return profile;
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // eslint-disable-next-line no-console
                console.log('Profile already exists for this user');

                return null;
            }
        }
        throw error;
    }
}

export async function getProfile(userId: UserId) {
    const profile = await prisma.profile.findFirst({
        where: {
            userId: userId,
        },
    });

    return profile;
}
