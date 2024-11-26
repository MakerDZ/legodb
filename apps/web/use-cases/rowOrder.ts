import { deleteRowOrder, getRowData } from '@/data-access/rowOrder';

export async function getRowTableuseCase(dbId: string) {
    const rowList = await getRowData(dbId);

    return rowList;
}

export async function deleteRowOrderUsecase(id: string, dbName: string) {
    const rowList = await deleteRowOrder(id, dbName);

    return rowList;
}
