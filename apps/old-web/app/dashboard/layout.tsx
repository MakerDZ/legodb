import React from 'react';

import { DashboardDataLayer } from '@/providers/DashboardLayer';
import Navigation from '@/components/dashboard/navigation/NavigationServer';

const HomeLayout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full min-h-full bg-white flex flex-row h-screen overflow-hidden">
            <Navigation />
            <DashboardDataLayer>{children}</DashboardDataLayer>
        </div>
    );
};

export default HomeLayout;
