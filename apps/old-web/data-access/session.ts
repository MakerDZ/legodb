import { prisma } from '@/lib/prisma';

export async function getSession(sessionId: string) {
    try {
        const session = await prisma.session.findUnique({
            where: {
                id: sessionId,
            },
        });

        if (!session) {
            return null;
        }

        const currentDate = new Date();
        const sessionExpirationDate = new Date(session.expiresAt);

        // Check if session is expired
        if (sessionExpirationDate <= currentDate) {
            // Delete the expired session
            await prisma.session.delete({
                where: {
                    id: sessionId,
                },
            });

            return null;
        }

        // If session is still valid, return it
        return session;
    } catch (error: unknown) {
        return null;
    }
}
