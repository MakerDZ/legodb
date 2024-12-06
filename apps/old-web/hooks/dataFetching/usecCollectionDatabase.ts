import { getCollectionDatabases } from '@/use-cases/database';
import { useQuery } from '@tanstack/react-query';

const useCollectionDatabaseData = (collectionName: string) => {
    const databaseQuery = async () => {
        const database = await getCollectionDatabases(collectionName);
        return database.map((item) => ({
            ...item,
            columnOrders: item.columnOrders.sort((a, b) => a.order - b.order),
        }));
    };

    const {
        data: databaseData,
        isLoading: isDatabaseDataLoading,
        error: databaseDataError,
        refetch: databaseDataRefetch,
    } = useQuery({
        queryKey: [`collectionDatabase-${collectionName}`],
        queryFn: () => databaseQuery(),
        refetchOnMount: false,
        staleTime: Infinity,
    });

    return {
        databaseData,
        isDatabaseDataLoading,
        databaseDataError,
        databaseDataRefetch,
    };
};

export default useCollectionDatabaseData;
