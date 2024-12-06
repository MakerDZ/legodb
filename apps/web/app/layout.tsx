import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import SideMenu from '@/components/app/SideMenu/SideMenuContainer';

export const metadata: Metadata = {
    title: 'LegoDB',
    description:
        '🚀 simple and go-to backend solution for all of your ship-fast project.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className="w-full min-h-screen font-nunito flex flex-row overflow-hidden"
                suppressHydrationWarning
            >
                <SideMenu />
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
