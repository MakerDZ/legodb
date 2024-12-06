import { deleteRowOrderAction } from '@/app/dashboard/[collection]/dashboard/action/dashboardAction';
import { sendWebhookNotification } from '@/data-access/webhook';
import { prisma } from '@/lib/prisma';
import { DataPhaser } from '@/utils/api-phaser';
import { handleCommonErrors } from '@/utils/handler';
import { RowData } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: { collection: string; table: string } }
) {
    try {
        const { table, collection } = params;
        const searchParams = new URLSearchParams(req.nextUrl.search);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
            return NextResponse.json(
                {
                    message: 'Invalid pagination parameters',
                },
                { status: 400 }
            );
        }

        const collectionData = await prisma.collection.findUnique({
            where: {
                name: collection,
            },
            select: {
                id: true,
            },
        });

        if (!collectionData) {
            return NextResponse.json(
                {
                    message: 'Collection not found',
                },
                { status: 404 }
            );
        }

        const rowOrder = await prisma.database.findFirst({
            where: {
                name: table,
                collectionId: collectionData.id,
            },
            select: {
                id: true,
                columnOrders: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });

        if (!rowOrder) {
            return NextResponse.json(
                {
                    message: 'rowOrder not found',
                },
                { status: 404 }
            );
        }

        const totalCount = await prisma.rowOrder.count({
            where: {
                databaseId: rowOrder.id,
            },
        });

        const topRowData = await prisma.rowOrder.findMany({
            where: {
                databaseId: rowOrder.id,
            },
            include: {
                rowData: true,
            },
            orderBy: {
                order: 'asc',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const nestedData = await DataPhaser(topRowData);

        return NextResponse.json({
            status: 200,
            data: nestedData,
            metadata: {
                currentPage: page,
                itemsPerPage: limit,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
            },
        });
    } catch (error) {
        console.error(
            'Error in GET /api/v1/database/[collection]/[table]:',
            error
        );
        return NextResponse.json(
            {
                message: 'An error occurred while processing the request',
            },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { db: string; table: string } }
) {
    try {
        // Parse request body and validate
        const body = await req.json();
        const { databaseId, rowData } = body;
        if (!databaseId || !Array.isArray(rowData) || rowData.length === 0) {
            return NextResponse.json(
                {
                    status: 400,
                    message:
                        "Invalid request body. 'databaseId' and 'rowData' are required.",
                },
                { status: 400 }
            );
        }

        // Retrieve the last order value for the specified database
        const lastRow = await prisma.rowOrder.findFirst({
            where: { databaseId },
            orderBy: { order: 'desc' },
        });

        const newOrder = lastRow ? lastRow.order + 1 : 1;

        const newRowOrder = await prisma.rowOrder.create({
            data: {
                databaseId,
                order: newOrder,
                rowData: {
                    create: rowData.map((row: RowData) => ({
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
                tableAccess: params.table,
            },
        });

        const responseForWebHook = {
            status: 'Created',
            data: newRowOrder,
        };

        for (const webhook of webHooks) {
            await sendWebhookNotification(webhook.webUrl, responseForWebHook);
        }

        return NextResponse.json({
            status: 200,
            data: newRowOrder,
        });
    } catch (error) {
        console.error('Error in POST /api/v1/[db]/[table]:', error);

        // Handle other errors
        return NextResponse.json(
            {
                status: 500,
                message: 'An unexpected error occurred.',
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { db: string; table: string } }
) {
    try {
        const body = await req.json();
        const { rowOrderId, rowData } = body;

        if (!rowOrderId || !Array.isArray(rowData)) {
            return NextResponse.json(
                {
                    status: 400,
                    message:
                        "Invalid request: 'rowOrderId' and 'rowData' are required.",
                },
                { status: 400 }
            );
        }

        // Fetch existing row order with its associated data
        const rowOrder = await prisma.rowOrder.findUnique({
            where: { id: rowOrderId },
            include: { rowData: true },
        });

        if (!rowOrder) {
            return NextResponse.json(
                {
                    status: 404,
                    message: 'RowOrder not found',
                },
                { status: 404 }
            );
        }

        // Update existing rows or prepare new data
        const updatedRowDataPromises = rowData.map(async (row: RowData) => {
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
            }
        });

        const updatedRowData = await Promise.all(updatedRowDataPromises);

        const webHooks = await prisma.webHook.findMany({
            where: {
                tableAccess: params.table,
            },
        });

        const responseForWebHook = {
            status: 'Updated',
            data: updatedRowData,
        };

        for (const webhook of webHooks) {
            await sendWebhookNotification(webhook.webUrl, responseForWebHook);
        }

        return NextResponse.json({
            status: 200,
            data: updatedRowData,
        });
    } catch (error) {
        console.error('Error updating row data:', error);
        return NextResponse.json(
            {
                status: 500,
                message: 'An error occurred while updating the row data.',
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { db: string; table: string } }
) {
    const body = await req.json();
    const { rowOrderId } = body;

    const deletedRow = await deleteRowOrderAction(rowOrderId, params.table);

    return NextResponse.json({
        status: 200,
        data: deletedRow,
    });
}
