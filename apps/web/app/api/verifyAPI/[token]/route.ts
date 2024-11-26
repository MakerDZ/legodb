import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async (
    req: Request,
    { params }: { params: { token: string } }
) => {
    try {
        const { token } = params;

        const getAPI = await prisma.tableAccessToken.findUnique({
            where: {
                token: token,
            },
        });

        if (!getAPI) {
            return NextResponse.json({
                valid: false,
            });
        }

        return NextResponse.json({
            valid: true,
            token: getAPI,
        });
    } catch (error) {
        console.log('Error in getting API token');
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};
