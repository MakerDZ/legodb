import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export async function createUser(email: string, role?: any) {
    const user = await prisma.user.create({
        data: {
            email: email,
            role: role,
        },
    });

    return user;
}

export async function getUserByEmail(email: string) {
    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    return user;
}

export async function getUserCount() {
    const user = await prisma.user.count();

    return user;
}

export const getUserById = cache(async (id: string) => {
    const user = await prisma.user.findFirst({
        where: {
            id: id,
        },
    });

    return user;
});

export const getUserRole = async (id: string) => {
    const role = await prisma.user.findFirst({
        where: {
            id: id,
        },
        select: {
            role: true,
        },
    });

    return role?.role;
};