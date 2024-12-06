'use client';
import useCollectionData from '@/hooks/dataFetching/useCollectionData';
import useDatabaseData from '@/hooks/dataFetching/useDatabaseData';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { LuTable } from 'react-icons/lu';
import APICard from './components/APICard';
import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/modal';
import CreateAPIToken from './components/CreateAPIToken';
import useApiData from '@/hooks/dataFetching/useAPIData';
import APIData from './components/APIData';
import API from './components/API';

const APIPage = () => {
    const {
        isOpen: isOpenModel,
        onOpen,
        onClose,
        onOpenChange,
    } = useDisclosure();

    const pathname = usePathname();
    const collectionName = pathname.substring(1).split('/')[1];

    const [selectTable, setSelectedTable] = useState<string | null>(null);

    // Fetch collection and database data
    const { collectionData } = useCollectionData();
    const collection = collectionData?.find(
        (collection) => collection.name === collectionName
    );

    const { databaseData, isDatabaseDataLoading, databaseDataError } =
        useDatabaseData();

    if (isDatabaseDataLoading) {
        return <div>Loading database data...</div>;
    }

    if (databaseDataError) {
        return (
            <div>Error fetching database data: {databaseDataError.message}</div>
        );
    }

    if (!collection || !databaseData) {
        return <div>No collection or database data found.</div>;
    }

    // Filter database data to only include those belonging to the selected collection
    const filteredDatabaseData = databaseData.filter(
        (data) => data.collectionId === collection.id
    );

    const selectedTable = filteredDatabaseData.find(
        (db) => db.id === selectTable
    );

    return (
        <div className="flex flex-row ">
            {/* Left Navigation Panel */}
            <div className="w-min-40 flex flex-col space-y-6">
                {filteredDatabaseData.map((data) => (
                    <div key={data.id}>
                        <div
                            onClick={() => setSelectedTable(data.id)}
                            className={`flex flex-row items-center justify-start px-4 mt-4 text-center rounded-xl ${
                                selectTable === data.id
                                    ? 'bg-[#F3F3F3] text-[#282621]'
                                    : 'text-[#7D7C77]'
                            } text-base font-semibold py-3 space-x-2 cursor-pointer`}
                        >
                            <LuTable />
                            <h1>{data.name}</h1>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-1 p-4  space-y-7  overflow-scroll">
                {selectTable ? (
                    filteredDatabaseData.map((database) => {
                        if (database.id === selectTable) {
                            return (
                                <div key={database.id}>
                                    <APICard
                                        columnOrders={database.columnOrders}
                                        name={database.name}
                                        id={database.id}
                                        collection={collectionName}
                                    />
                                </div>
                            );
                        }
                        return null;
                    })
                ) : (
                    <>
                        {filteredDatabaseData.length == 0 && (
                            <p>No DB, create one </p>
                        )}
                        {filteredDatabaseData.length > 0 && !selectTable && (
                            <p>select db from left</p>
                        )}
                    </>
                )}
            </div>

            {selectTable && (
                <div>
                    <div className="flex justify-end w-full">
                        <Button
                            className=" !bg-[#0D98FE]"
                            onPress={onOpen}
                            color="primary"
                        >
                            Create API Key
                        </Button>
                    </div>
                    <div className=" rounded-lg  w-min-40 flex-1 p-8">
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-lg font-bold">
                                {selectedTable?.name} API Token
                            </h1>
                        </div>

                        {selectTable && <API selectedTable={selectedTable} />}
                    </div>
                </div>
            )}

            <CreateAPIToken
                onClose={onClose}
                isOpenModel={isOpenModel}
                onOpenChange={onOpenChange}
                data={filteredDatabaseData}
            />
        </div>
    );
};

export default APIPage;
