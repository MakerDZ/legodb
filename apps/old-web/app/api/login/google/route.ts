import { generateCodeVerifier, generateState } from 'arctic';
import { cookies } from 'next/headers';

import { googleAuth } from '@/lib/auth';

export async function GET(): Promise<Response> {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = await googleAuth.createAuthorizationURL(state, codeVerifier, {
        scopes: ['profile', 'email'],
    });

    cookies().set('google_oauth_state', state, {
        secure: true,
        path: '/',
        httpOnly: true,
        maxAge: 86400,
    });

    cookies().set('google_code_verifier', codeVerifier, {
        secure: true,
        path: '/',
        httpOnly: true,
        maxAge: 86400,
    });

    return Response.redirect(url);
}
