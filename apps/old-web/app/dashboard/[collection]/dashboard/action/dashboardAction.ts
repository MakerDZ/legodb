'use server';
import { prisma } from '@/lib/prisma';
import { deleteRowOrderUsecase } from '@/use-cases/rowOrder';
import { IRowOrder } from '../components/InlineDBDashboard';
import { updateRowOrder } from '@/data-access/rowOrder';
import { applyRateLimit, handleCommonErrors } from '@/utils/handler';
import { sendWebhookNotification } from '@/data-access/webhook';

export const createRowOrder = async (data: {
    dbname?: string;
    databaseId: string;
    order: number;
    rowData: any[];
}) => {
    try {
        const { databaseId, rowData } = data;

        //await applyRateLimit('edit-rowdata', 10, 60000);

        const lastRow = await prisma.rowOrder.findFirst({
            where: { databaseId },
            orderBy: { order: 'desc' },
        });

        const newNo = lastRow ? lastRow.order + 1 : 1;

        const newRowOrder = await prisma.rowOrder.create({
            data: {
                databaseId,
                order: newNo,
                rowData: {
                    create: rowData.map((row) => ({
                        name: row.name,
                        type: row.type,
                        content: JSON.stringify(row.content),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })),
                },
            },
            include: {
                rowData: true,
            },
        });

        const webHooks = await prisma.webHook.findMany({
            where: {
                tableAccess: data.dbname,
            },
        });

        const responseForWebHook = {
            status: 'Created',
            data: newRowOrder,
        };

        for (const webhook of webHooks) {
            await sendWebhookNotification(webhook.webUrl, responseForWebHook);
        }

        return newRowOrder;
    } catch (error) {
        const handleError = await handleCommonErrors(error);
        console.error('Errorr creating row data:', error);
        return {
            error: handleError.error || 'error',
        };
    }
};

export const editRowOrderAction = async (data: {
    rowOrderId: string;
    order: number;
    dbname: string;
    rowData: any[];
}) => {
    const rowOrder = await prisma.rowOrder.findUnique({
        where: { id: data.rowOrderId },
        include: { rowData: true },
    });

    if (!rowOrder) {
        throw new Error('RowOrder not found');
    }

    //await applyRateLimit('edit-rowdata', 10, 60000);

    try {
        // Iterate through rowData and check if an element has an ID
        const updatedRowDataPromises = data.rowData.map(async (row) => {
            const existingRow = rowOrder.rowData.find(
                (rowOrderRow) => rowOrderRow.id === row.id
            );

            if (existingRow) {
                return await prisma.rowData.update({
                    where: { id: row.id },
                    data: {
                        content: JSON.stringify(row.content),
                        updatedAt: new Date(),
                    },
                });
            } else if (!row.id) {
                return await prisma.rowData.create({
                    data: {
                        content: JSON.stringify(row.content),
                        rowOrderId: data.rowOrderId,
                        name: row.name,
                        type: row.type,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
            }
            return row;
        });

        const updatedRowData = await Promise.all(updatedRowDataPromises);

        const webHooks = await prisma.webHook.findMany({
            where: {
                tableAccess: data.dbname,
            },
        });

        const responseForWebHook = {
            status: 'Updated',
            data: updatedRowData,
        };

        for (const webhook of webHooks) {
            await sendWebhookNotification(webhook.webUrl, responseForWebHook);
        }

        return updatedRowData;
    } catch (error) {
        const handleError = await handleCommonErrors(error);
        console.error('Error updating or creating row data:', error);
        return {
            error: handleError.error || 'error',
        };
    }
};

export const updaterDashboardRowOrderAction = async (
    rowOrders: IRowOrder[]
) => {
    try {
        //await applyRateLimit(`update-row-`, 10, 60000);

        return await updateRowOrder(rowOrders);
    } catch (error) {
        const handledError = await handleCommonErrors(error);

        return {
            error: handledError.error || 'error',
        };
    }
};

export const deleteRowOrderAction = async (id: string, dbName: string) => {
    const deletedrowOrder = await deleteRowOrderUsecase(id, dbName);

    return deletedrowOrder;
};

