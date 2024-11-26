import { getRowTableuseCase } from '@/use-cases/rowOrder';
import { useQuery } from '@tanstack/react-query';

const useRowTableRow = (dbID: string) => {
    const rowQuery = async () => {
        const rowData = await getRowTableuseCase(dbID);
        return rowData
            .sort((a, b) => a.order - b.order)
            .map((row) => ({
                ...row,
            }));
    };

    const {
        data: rowData,
        isLoading: isrowLoading,
        error: isRowError,
        refetch: rowRefetch,
    } = useQuery({
        queryKey: [`DbRow-${dbID}`],
        queryFn: () => rowQuery(),
        refetchOnMount: false,
        staleTime: Infinity,
    });

    return {
        rowData,
        isrowLoading,
        isRowError,
        rowRefetch,
    };
};

export default useRowTableRow;
