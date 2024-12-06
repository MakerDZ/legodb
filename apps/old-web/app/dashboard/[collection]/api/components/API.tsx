import useApiData from '@/hooks/dataFetching/useAPIData';
import React from 'react';
import APIData from './APIData';

const API: React.FC<{ selectedTable: any }> = ({ selectedTable }) => {
    const { apiData } = useApiData();

    return (
        <div className="mt-6">
            <div className="flex flex-col space-y-4 mt-6">
                {apiData
                    ?.filter((item) => item.tableAccess === selectedTable.name)
                    .map((item) => <APIData item={item} key={item.id} />)}
            </div>
        </div>
    );
};

export default API;
