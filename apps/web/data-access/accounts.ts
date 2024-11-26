import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function createAccountViaGoogle(userId: string, googleId: string) {
    try {
        const account = await prisma.account.create({
            data: {
                userId: userId,
                accountType: 'GOOGLE',
                googleId: googleId,
            },
        });

        return account;
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // this is to handle duplicate record bro
                // eslint-disable-next-line no-console
                console.log('Account already exists for this Google ID');

                return null;
            }
        }
        throw error;
    }
}

export async function getAccountByGoogleId(googleID: string) {
    return await prisma.account.findFirst({
        where: {
            googleId: googleID,
        },
    });
}

// We need to use email instead of Google ID because later we will add the ability to manually link a Google account for God access in the dashboard.
export async function isExistingAccount(email: string) {
    return await prisma.user.findUnique({
        where: {
            email,
        },
    });
}
