'use server';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { UserId } from 'lucia';
import { ObjectId } from 'mongodb';

import 'server-only';
import { lucia, validateRequest } from './auth';

import { AuthenticationError } from '@/app/util';
import { getUserRole } from '@/data-access/users';

export const getCurrentUser = cache(async () => {
    const session = await validateRequest();

    if (!session.user) {
        return undefined;
    }

    return session.user;
});

export const assertAuthenticated = async () => {
    const user = await getCurrentUser();

    if (!user) {
        throw new AuthenticationError();
    }
    const role = await getUserRole(user.id);

    if (!role) {
        throw new Error('Role error');
    }

    return { user, role };
};

export async function setSession(userId: UserId) {
    try {
        // Generate a new MongoDB ObjectId for the session
        const sessionId = new ObjectId().toString();

        // Create a session using Lucia with the generated ObjectId
        await lucia.createSession(userId, { id: sessionId });

        // Create a session cookie using the session ID from Lucia
        const sessionCookie = lucia.createSessionCookie(sessionId);

        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );
    } catch (e) {
        throw e;
    }
}
