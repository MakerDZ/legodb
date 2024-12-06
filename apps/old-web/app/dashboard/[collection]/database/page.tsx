'use client';

import InlineDB from '@/app/dashboard/[collection]/database/components/InlineDB';
import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/modal';
import React from 'react';
import { usePathname } from 'next/navigation';
import { CreateDatabaseModal } from './components/CreateDatabase';
import useDatabaseData from '@/hooks/dataFetching/useDatabaseData';
import useCollectionData from '@/hooks/dataFetching/useCollectionData';

const DatabasePage = () => {
    const pathname = usePathname();
    const collectionName = pathname.substring(1).split('/')[1];

    // We need to map the collection ID with the collection name. Actually, we should link to the collection name, not the collection ID.
    const { collectionData } = useCollectionData();
    const collection = collectionData?.find(
        (collection) => collection.name == collectionName
    );

    const { databaseData } = useDatabaseData();
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();


    if (collection && databaseData) {
        return (
            <>
                <div className="min-w-full overflow-auto">
                    <Button
                        onClick={onOpen}
                        size="sm"
                        className="absolute top-0 right-0 bg-[#0A99FE] text-[#FFFFFF]"
                    >
                        New Database
                    </Button>
                    <div className="space-y-7">
                        {databaseData.map((database) => {
                            if (database.collectionId == collection.id) {
                                return <InlineDB data={database} />;
                            }
                        })}
                    </div>
                </div>
                <CreateDatabaseModal
                    isOpen={isOpen}
                    closeIt={onClose}
                    onOpenChange={onOpenChange}
                    collectionName={collectionName}
                />
            </>
        );
    }

    return <></>;
};

export default DatabasePage;
