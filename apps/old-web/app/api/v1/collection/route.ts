import { getCollections } from '@/data-access/collection';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async (req: Request) => {
    try {
        const collections = await prisma.collection.findMany({
            include: {
                databases: true,
            },
        });

        return NextResponse.json({
            message: 'success',
            data: collections,
        });
    } catch (error) {
        console.error('Error fetching collections:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { name } = body;

        const newCollection = await prisma.collection.create({
            data: {
                name,
            },
        });

        return NextResponse.json({
            message: 'Collection created successfully',
            data: newCollection,
        });
    } catch (error) {
        console.error('Error creating collection:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

export const PUT = async (req: Request) => {
    try {
        const body = await req.json();
        const { id, name } = body;

        const updatedCollection = await prisma.collection.update({
            where: { id },
            data: { name },
        });

        return NextResponse.json({
            message: 'Collection updated successfully',
            data: updatedCollection,
        });
    } catch (error) {
        console.error('Error updating collection:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

export const DELETE = async (req: Request) => {
    try {
        const { id } = await req.json();

        await prisma.collection.delete({
            where: { id },
        });

        return NextResponse.json({
            message: 'Collection deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting collection:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};
