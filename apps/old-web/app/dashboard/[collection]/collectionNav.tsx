'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const CollectionNav = ({ dashboardNav }: any) => {
    const pathName = usePathname();

    return (
        <div className="flex flex-row space-x-8 mb-6">
            {dashboardNav.map((item: any) => {
                const isActive = pathName === item.route;

                return (
                    <Link key={item.name} href={item.route}>
                        <p
                            className={`text-lg font-semibold  ${isActive ? 'text-[#282621] ' : 'text-[#73737C]'}  `}
                        >
                            {' '}
                            {item.name}
                        </p>
                    </Link>
                );
            })}
        </div>
    );
};

export default CollectionNav;
