'use server';
import {
    UnauthenticatedError,
    UnauthorizedError,
} from '@/entities/errors/auth';
import { InputParseError } from '@/entities/errors/common';
import { RateLimitError } from '@/lib/errors';
import { rateLimitByIp } from '@/lib/limiter';
import { $Enums } from '@prisma/client';

export async function Restrictet(role: $Enums.Role | undefined) {
    if (role == 'Entry') {
        throw new UnauthorizedError(
            'Entry User Cannot access to that function'
        );
    }
}


export const applyRateLimit = async (
    key: string,
    limit = 10,
    window = 60000
) => {
    await rateLimitByIp({
        key,
        limit,
        window,
    });
};

export const handleCommonErrors = async (error: unknown) => {
    if (error instanceof InputParseError) {
        return { error: error.message };
    }
    if (error instanceof UnauthenticatedError) {
        return { error: 'Must be logged in to perform this action' };
    }
    if (error instanceof UnauthorizedError) {
        return { error: 'Restricted Function' };
    }
    if (error instanceof RateLimitError) {
        return { error: 'Rate limit exceeded, please try again later' };
    }
    return {
        error: 'An unexpected error occurred. The developers have been notified. Please try again later.',
    };
};
