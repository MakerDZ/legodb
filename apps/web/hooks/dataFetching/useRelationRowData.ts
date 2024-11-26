import { getDatabaseWithRow } from '@/data-access/database';
import { useQuery } from '@tanstack/react-query';

const useRelationRowData = (dbID: string, name: string) => {
    const rowQuery = async () => {
        const rowData = await getDatabaseWithRow(dbID, name);
        return rowData;
    };

    const {
        data: rowDataSelect,
        isLoading: isrowLoading,
        error: isRowError,
        refetch: rowRefetch,
    } = useQuery({
        queryKey: [`relation-${dbID}`],
        queryFn: () => rowQuery(),
        refetchOnMount: false,
        staleTime: Infinity,
    });

    return {
        rowDataSelect,
        isrowLoading,
        isRowError,
        rowRefetch,
    };
};

export default useRelationRowData;
