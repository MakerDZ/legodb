import { getDatabaseUseCase } from '@/use-cases/database';
import { useQuery } from '@tanstack/react-query';

const useDatabaseData = () => {
    const databaseQuery = async () => {
        const database = await getDatabaseUseCase();
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
        queryKey: ['databaseData'],
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

export default useDatabaseData;
