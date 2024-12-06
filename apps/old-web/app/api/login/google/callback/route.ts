import { cookies } from 'next/headers';
import { OAuth2RequestError } from 'arctic';

import { googleAuth } from '@/lib/auth';
import { setSession } from '@/lib/session';
import { afterLoginUrl } from '@/utils/app-config';
import { createGoogleUserUseCase } from '@/use-cases/users';
import { getUserCount } from '@/data-access/users';
import {
    createAccountViaGoogle,
    getAccountByGoogleId,
    isExistingAccount,
} from '@/data-access/accounts';
import { createProfile, getProfile } from '@/data-access/profiles';

export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies().get('google_oauth_state')?.value ?? null;
    const codeVerifier = cookies().get('google_code_verifier')?.value ?? null;

    if (
        !code ||
        !state ||
        !storedState ||
        state !== storedState ||
        !codeVerifier
    ) {
        return new Response(null, {
            status: 400,
        });
    }
    try {
        const tokens = await googleAuth.validateAuthorizationCode(
            code,
            codeVerifier
        );

        const response = await fetch(
            'https://openidconnect.googleapis.com/v1/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                },
            }
        );
        const googleUser: GoogleUser = await response.json();

        // We need to use email instead of Google ID because later we will add the ability to manually link a Google account for God access in the dashboard.
        const existingAccount = await isExistingAccount(googleUser.email);

        if (existingAccount) {
            //avoid redundant calls
            const [existingProfile, accountExist] = await Promise.all([
                getProfile(existingAccount.id),
                getAccountByGoogleId(googleUser.sub),
            ]);

            if (!existingProfile) {
                await createProfile(
                    existingAccount.id,
                    googleUser.name,
                    googleUser.picture
                );
            }

            if (!accountExist) {
                await createAccountViaGoogle(
                    existingAccount.id,
                    googleUser.sub
                );
            }

            await setSession(existingAccount.id);

            return new Response(null, {
                status: 302,
                headers: {
                    Location: afterLoginUrl,
                },
            });
        }

        // checking if the dashboard already had a god or not
        const authorizedCount = await getUserCount();

        if (authorizedCount >= 1) {
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/sign-in',
                },
            });
        }

        if (authorizedCount === 0) {
            const userId = await createGoogleUserUseCase(googleUser, 'God');

            await setSession(userId);
        }

        return new Response(null, {
            status: 302,
            headers: {
                Location: afterLoginUrl,
            },
        });
    } catch (e) {
        if (e instanceof OAuth2RequestError) {
            // invalid code
            return new Response(null, {
                status: 400,
            });
        }

        return new Response(null, {
            status: 500,
        });
    }
}

export interface GoogleUser {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
    locale: string;
}
