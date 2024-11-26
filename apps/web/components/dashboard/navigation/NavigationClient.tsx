'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import NavItem from './NavItem';

import { useDisclosure } from '@nextui-org/modal';

import useCollectionData from '@/hooks/dataFetching/useCollectionData';
import { useQueryClient } from '@tanstack/react-query';

import ProfileNav from './Profile';
import useUserProfile from '@/hooks/dataFetching/useUserProfile';

const NavigationClient = () => {
    const queryClient = useQueryClient();
    const { collectionData } = useCollectionData();

    const { role } = useUserProfile();

    if (!role) {
        return <div>Error loading user data.</div>;
    }

    const pathname = usePathname();

    const isSettingsPage = pathname.startsWith('/dashboard/settings');
    let dyPathname = pathname.split('/')[2];

    if (isSettingsPage) {
        return <></>;
    }

    return (
        <div className="min-w-[290px] h-full  bg-[#F7F7F5] px-4 py-5  ">
            <ProfileNav />

            <div className="flex flex-col space-y-1">
                {collectionData?.map((item) => {
                    const isActive = dyPathname === item.name;

                    return (
                        <NavItem
                            role={role}
                            key={item.id}
                            queryClient={queryClient}
                            isActive={isActive}
                            item={item}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default NavigationClient;

