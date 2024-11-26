import { NextRequest, NextResponse } from 'next/server';
import { env } from './types/env';

export default async function middleware(req: NextRequest) {
    const { method } = req;
    const sessionToken = req.cookies.get('auth_session')?.value;
    const pathName = req.nextUrl.pathname;
    const pathSegments = pathName.split('/');


    // Helper function to validate token permissions
    async function validateToken(
        type: 'God' | 'API',
        token: string,
        resource?: string
    ) {
        const endpoint = type === 'God' ? 'verifygodtoken' : 'verifyAPI';
        const response = await fetch(
            `${env.HOST_NAME}/api/${endpoint}/${token}`
        );

        if (!response.ok) {
            return { valid: false, error: 'Invalid token' };
        }

        const tokenData = await response.json();
        if (!tokenData?.token) {
            return { valid: false, error: 'Invalid token' };
        }

        const { dataAccessLevel, actionAccessLevel, tableAccess } =
            tokenData.token;

        // Check if permissions match resource and action for 'God' or 'API' token types
        if (
            (type === 'God' &&
                dataAccessLevel.includes(resource) &&
                actionAccessLevel.includes(method)) ||
            (type === 'API' &&
                tableAccess === resource &&
                actionAccessLevel.includes(method))
        ) {
            return { valid: true };
        }

        return { valid: false, error: 'Forbidden: insufficient permissions' };
    }

    // Authorization checks for API routes
    if (pathName.startsWith('/api')) {
        const token = req.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json(
                { error: 'Token required' },
                { status: 401 }
            );
        }

        const isApiWithTable = pathSegments.length === 6; // Check if route is /api/v1/database/dbName/tableName
        const resource = isApiWithTable ? pathSegments[5] : pathSegments[3];
        const tokenType = isApiWithTable ? 'API' : 'God';

        try {
            const { valid, error } = await validateToken(
                tokenType,
                token,
                resource
            );
            if (valid) {
                return NextResponse.next();
            }
            return NextResponse.json({ error }, { status: 403 });
        } catch (error) {
            console.error('Error during token verification:', error);
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 }
            );
        }
    }

    // Session validation for dashboard and sign-in routes
    try {
        const response = await fetch(
            `${env.HOST_NAME}/api/session/${sessionToken}`
        );
        const { valid: isValidToken } = await response.json();

        if (!isValidToken && pathName.startsWith('/dashboard')) {
            const redirectResponse = NextResponse.redirect(
                `${req.nextUrl.origin}/sign-in`
            );
            redirectResponse.cookies.set('auth_session', '', {
                path: '/',
                maxAge: 0,
            });
            return redirectResponse;
        }

        if (isValidToken && pathName.startsWith('/sign-in')) {
            return NextResponse.redirect(`${req.nextUrl.origin}/dashboard`);
        }

        return NextResponse.next();
    } catch (err) {
        console.error('Error validating session:', err);
        const redirectResponse = NextResponse.redirect(
            `${req.nextUrl.origin}/sign-in`
        );
        redirectResponse.cookies.set('auth_session', '', {
            path: '/',
            maxAge: 0,
        });
        return redirectResponse;
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/sign-in', '/api/v1/:path*'],
};
