'use client';
import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/modal';


import React from 'react';
import CreateModelToken from './CreateModelToken';
import useApiTokenData from '@/hooks/dataFetching/useAPITokenData';
import APITokenCard from './APITokenCard';

const APITokenCreation = () => {
    const {
        isOpen: isOpenModel,
        onOpen,
        onClose,
        onOpenChange,
    } = useDisclosure();

    const { apitokenData } = useApiTokenData();

    return (
        <div className="overflow-scroll">
            <div className="flex flex-row justify-end w-full h-full">
                <Button
                    onPress={onOpen}
                    color="primary"
                    className="w-auto !bg-[#0D98FE]"
                >
                    Create API Token
                </Button>

                <CreateModelToken
                    onClose={onClose}
                    isOpenModel={isOpenModel}
                    onOpenChange={onOpenChange}
                />
            </div>

            <div>
                <h1 className="text-2xl font-bold">God Access Token List</h1>
                <div className="flex flex-col space-y-4 mt-6 ">
                    {apitokenData?.map((item) => (
                        <APITokenCard item={item} key={item.id} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default APITokenCreation;
