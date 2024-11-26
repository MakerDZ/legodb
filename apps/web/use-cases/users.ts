'use server';
import { UserId, UserSession } from './types';
import { PublicError } from './errors';

import { GoogleUser } from '@/app/api/login/google/callback/route';
import { createAccountViaGoogle } from '@/data-access/accounts';
import { createProfile, getProfile } from '@/data-access/profiles';
import { createUser, getUserByEmail, getUserRole } from '@/data-access/users';
import { getCurrentUser } from '@/lib/session';

export async function createGoogleUserUseCase(
    googleUser: GoogleUser,
    role?: string
) {
    let existingUser = await getUserByEmail(googleUser.email);

    if (!existingUser) {
        existingUser = await createUser(googleUser.email, role);
    }

    await createAccountViaGoogle(existingUser.id, googleUser.sub);

    await createProfile(existingUser.id, googleUser.name, googleUser.picture);

    return existingUser.id;
}

export async function getUserProfileUseCase(userId: UserId) {
    const profile = await getProfile(userId);

    if (!profile) {
        throw new PublicError('User not found');
    }

    return profile;
}

export async function getUserRoleUseCase() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const userRole = await getUserRole(user?.id);

    return userRole;
}
