'use server';
import { IRowOrder } from '@/app/dashboard/[collection]/dashboard/components/InlineDBDashboard';
import { prisma } from '@/lib/prisma';
import { sendWebhookNotification } from './webhook';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const YOUR_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const getRowData = async (dbId: string) => {
    try {
        const rowTable = await prisma.rowOrder.findMany({
            where: {
                databaseId: dbId,
            },
            include: {
                rowData: true,
            },
        });
        return rowTable;
    } catch (err) {
        console.error('Error fetching rowTable:', err);
        throw new Error('Failed to fetch rowTable');
    }
};

export async function deleteImageByUrl(imageUrl: string) {
    // Extract the path from the URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${YOUR_PROJECT_ID}.appspot.com/o/`;
    const path = decodedUrl.replace(baseUrl, '').split('?')[0];

    const imageRef = ref(storage, path);

    try {
        await deleteObject(imageRef);
        console.log('Image deleted successfully');
    } catch (error) {
        console.error('Error deleting image:', error);
    }
}

export const deleteRowOrder = async (id: string, dbName: string) => {
    const rowTable = await prisma.rowOrder.delete({
        where: {
            id: id,
        },
        include: {
            rowData: true,
        },
    });

    const responseForWebHook = {
        status: 'deleted',
        data: rowTable,
    };

    const webHooks = await prisma.webHook.findMany({
        where: {
            tableAccess: dbName,
        },
    });

    for (const webhook of webHooks) {
        await sendWebhookNotification(webhook.webUrl, responseForWebHook);
    }

    for (const item of rowTable.rowData) {
        if (item.type === 'Attachment') {
            const content =
                typeof item.content === 'string'
                    ? JSON.parse(item.content)
                    : item.content;
            if (content) {
                await deleteImageByUrl(content);
            }
        }
    }

    return rowTable;
};

export const updateRowOrder = async (rows: IRowOrder[]) => {
    try {
        const updatedRows = await prisma.$transaction(
            rows.map((row) =>
                prisma.rowOrder.update({
                    where: { id: row.id },
                    data: { order: row.order },
                    include: { rowData: true },
                })
            )
        );

        return updatedRows;
    } catch (err) {
        console.error('Error sorting database row:', err);
        throw new Error('Failed to sort database rows.');
    }
};