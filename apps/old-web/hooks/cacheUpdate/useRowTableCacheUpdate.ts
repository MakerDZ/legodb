import { ColumnOrder, RowData } from '@prisma/client';
import { QueryClient } from '@tanstack/react-query';


interface IRowOrder {
    databaseId: string;
    id: string;
    order: number;
    rowData: RowData[];
}

export const useRowTableCacheUpdate = (
    dbID: string,
    queryClient: QueryClient
) => {
    const setRowTableData = (newRowTable: IRowOrder) => {
        queryClient.setQueryData([`DbRow-${dbID}`], (data: RowData[]) => {
            return [...data, newRowTable];
        });
    };

    const deleteRowTableData = (deletedTable: IRowOrder) => {
        queryClient.setQueryData([`DbRow-${dbID}`], (data: RowData[] = []) => {
            const updatedRowOrder = data.filter(
                (rowdata) => rowdata.id != deletedTable.id
            );

            return updatedRowOrder;
        });
    };

    return {
        setRowTableData,
        deleteRowTableData,
    };
};
