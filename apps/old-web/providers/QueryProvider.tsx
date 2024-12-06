'use client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
