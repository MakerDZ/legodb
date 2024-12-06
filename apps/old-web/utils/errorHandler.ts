import { UnauthenticatedError } from '@/entities/errors/auth';
import { InputParseError } from '@/entities/errors/common';
import { RateLimitError } from '@/lib/errors';

export function handleError(error: unknown): { error: string } {
    if (error instanceof InputParseError) {
        return { error: error.message };
    }

    if (error instanceof UnauthenticatedError) {
        return { error: 'Must be logged in to perform this action' };
    }

    if (error instanceof RateLimitError) {
        return { error: 'Rate limit exceeded, please try again later' };
    }

    // Fallback for unknown errors
    console.error('Unexpected error:', error);
    return {
        error: 'An unexpected error occurred. The developers have been notified. Please try again later.',
    };
}
