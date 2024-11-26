import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { Lucia, Session, User } from 'lucia';
import { Google } from 'arctic';
import { cookies } from 'next/headers';

import { env } from '../types/env';

import { prisma } from './prisma';

import { UserId as CustomerId } from '@/use-cases/types';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === 'production',
        },
    },

    getUserAttributes: (attributes) => {
        return {
            id: attributes.id,
        };
    },
});

export const validateRequest = async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
> => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
        return {
            user: null,
            session: null,
        };
    }

    const result = await lucia.validateSession(sessionId);

    try {
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);

            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie();

            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
    } catch {}

    return result;
};

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: {
            id: CustomerId;
        };
        UserId: CustomerId;
    }
}

export const googleAuth = new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.HOST_NAME}/api/login/google/callback`
);
