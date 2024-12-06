'use client';

import { Spinner } from '@nextui-org/spinner';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export function DashboardDataLayer({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    const isSettingsPage = pathname.startsWith('/dashboard/settings');

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex w-full flex-1 flex-col justify-center">
                <Spinner className="" color="warning" size="md" />
            </div>
        );
    }

    return (
        <div
            className={`${isSettingsPage ? '' : 'p-8'} w-full overflow-x-auto`}
        >
            {children}
        </div>
    );
}
