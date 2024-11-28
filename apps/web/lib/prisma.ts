// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '@legodb/db';

const client = new PrismaClient({
    errorFormat: 'pretty',
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? client;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
