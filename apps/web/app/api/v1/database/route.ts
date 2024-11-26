import { createDatabase } from '@/data-access/database';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async (req: Request) => {
    try {
        const databases = await prisma.database.findMany({
            include: {
                collection: true, // Include the related collection
            },
        });

        return NextResponse.json({
            message: 'success',
            data: databases,
        });
    } catch (error) {
        console.error('Error fetching databases:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { name, collectionId } = body;


        const newDatabase = await createDatabase(name, collectionId);


        return NextResponse.json({
            message: 'Database created successfully',
            data: newDatabase,
        });
    } catch (error) {
        console.error('Error creating database:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

export const PUT = async (req: Request) => {
    try {
        const body = await req.json();
        const { id, name, columnOrders } = body;

        const updatedDatabase = await prisma.database.update({
            where: { id },
            data: { name, columnOrders },
        });

        return NextResponse.json({
            message: 'Database updated successfully',
            data: updatedDatabase,
        });
    } catch (error) {
        console.error('Error updating database:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

export const DELETE = async (req: Request) => {
    try {
        const { id } = await req.json();

        await prisma.database.delete({
            where: { id },
        });

        return NextResponse.json({
            message: 'Database deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting database:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};
