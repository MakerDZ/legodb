'use client';

import { Button, Image } from '@nextui-org/react';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    const errorMessage = error?.message || 'An unexpected error occurred';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
            <Image
                src="/images/error.png"
                alt="Broken LEGO structure"
                width={200}
                height={200}
                className="mx-auto"
            />
            <h1 className="text-4xl font-bold text-primary">
                Oops! Something went wrong
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
                Looks like our LEGO structure tumbled down. Let's rebuild it!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Error: {errorMessage}
            </p>
            <Button
                color="primary"
                size="lg"
                className="mt-4 font-semibold !bg-[#0D98FE]"
                onClick={() => reset()}
            >
                Try Again
            </Button>
        </div>
    );
}
