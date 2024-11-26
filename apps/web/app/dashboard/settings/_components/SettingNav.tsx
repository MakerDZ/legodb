'use client';
import { GoArrowLeft } from 'react-icons/go';
import React, { useState } from 'react';
import Link from 'next/link';
import { IoPersonOutline } from 'react-icons/io5';
import { TbLockAccess } from 'react-icons/tb';
import { usePathname } from 'next/navigation';
import { Button } from '@nextui-org/button';
import NProgress from 'nprogress';
import { signOutAction } from '../_actions/sign-out-action';
import { IoMdSettings } from 'react-icons/io';

interface IAccountNav {
    id: number;
    name: string;
    route: string;
    icon: any;
}

const GodAccess: IAccountNav[] = [
    {
        id: 1,
        name: 'Profile',
        route: '/profile',
        icon: <IoPersonOutline size={24} />,
    },
    {
        id: 2,
        name: 'Role and Permission',
        route: '/role-and-permission',
        icon: <TbLockAccess size={24} />,
    },
    {
        id: 3,
        name: 'API Token',
        route: '/API-token',
        icon: <IoMdSettings size={24} />,
    },
];

const EntryAccess: IAccountNav[] = [
    {
        id: 1,
        name: 'Profile',
        route: '/profile',
        icon: <IoPersonOutline size={24} />,
    },
];

const SettingNav = (role: any) => {
    const pathname = usePathname();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const path = pathname.split('/')[3];

    const navDataAccess = role.role === 'God' ? GodAccess : EntryAccess;

    return (
        <div className="w-[390px] bg-[#F7F7F5] p-8 h-screen sticky left-0 top-0  ">
            <Link href="/dashboard">
                <div className="flex items-center space-x-4">
                    <GoArrowLeft size={24} />
                    <p className="text-lg font-bold">Back</p>
                </div>
            </Link>

            <div className="mt-6 flex flex-col space-y-4 ">
                {navDataAccess.map((item, index) => {
                    const isActive = path === item.route.split('/')[1];
                    const isHovered = hoveredIndex === index;

                    return (
                        <Link
                            key={item.id}
                            href={`/dashboard/settings${item.route}`}
                        >
                            <div
                                className={`flex flex-row items-center space-x-4 px-3 py-2 rounded-lg cursor-pointer ${
                                    isActive || isHovered ? 'bg-[#EFEFED]' : ''
                                }`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {item.icon}
                                <p
                                    className={`text-lg font-semibold ${
                                        isActive
                                            ? 'text-[#282621]'
                                            : 'text-[#5F5E5A]'
                                    }`}
                                >
                                    {item.name}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="flex flex-col justify-end mt-12">
                <Button
                    className="!bg-[#EB0E5C]"
                    onClick={async () => {
                        NProgress.start();
                        await signOutAction();
                        NProgress.done();
                    }}
                    color="danger"
                >
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default SettingNav;
