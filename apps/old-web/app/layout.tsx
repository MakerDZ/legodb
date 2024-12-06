import '@/styles/globals.css';
import { Metadata, Viewport } from 'next';
import { Suspense } from 'react';

import { Providers } from '../providers/next-provider';

import { siteConfig } from '@/config/site';
import AppLoading from './loading';
import { QueryProviders } from '@/providers/QueryProvider';

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

export const viewport: Viewport = {
    themeColor: [{ color: 'white', media: '(prefers-color-scheme: light)' }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning lang="en">
            <head />
            <body className="min-h-screen w-full font-nunito">
                <Providers>
                    <Suspense fallback={<AppLoading />}>
                        <QueryProviders>{children}</QueryProviders>
                    </Suspense>
                </Providers>
            </body>
        </html>
    );
}
