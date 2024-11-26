'use client';

import { Tooltip, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import CreateCollectionModel from './CreateCollectionModel';
import useUserProfile from '@/hooks/dataFetching/useUserProfile';
import { GoPlus } from 'react-icons/go';

const ProfileNav = () => {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const { profile, role, isUserLoading } = useUserProfile();

    if (isUserLoading) {
        return <div>Loading...</div>;
    }

    if (!profile || !role) {
        return <div>Error loading user data.</div>;
    }


    return (
        <div className="flex flex-row justify-between items-center mb-6 px-2">
            <Link className="cursor-pointer" href="/dashboard/settings/profile">
                <div className="flex flex-row space-x-2 items-center  ">
                    <Image
                        alt="company logo"
                        className="rounded-[6px]"
                        height={32}
                        src={profile.image!}
                        width={32}
                    />

                    <Tooltip content={profile.displayName || 'Legobase'}>
                        <p className="text-lg text-[#5F5E5A] font-nunito font-bold truncate ">
                            {profile.displayName || 'Legobase'}
                        </p>
                    </Tooltip>

                    <IoIosArrowDown color="#5F5E5A" size={20} />
                </div>
            </Link>

            {role === 'God' && (
                <GoPlus
                    onClick={onOpen}
                    className="hover:cursor-pointer hover:bg-white rounded-2xl"
                    size={30}
                />
            )}

            <CreateCollectionModel
                isOpen={isOpen}
                closeIt={onClose}
                onOpenChange={onOpenChange}
            />
        </div>
    );
};

export default ProfileNav;
