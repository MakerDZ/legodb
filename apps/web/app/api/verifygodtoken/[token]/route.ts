import { getGodToken } from '@/data-access/ApiToken';
import { NextResponse } from 'next/server';

export const GET = async (req: Request, { params }: { params: { token: string } }) => {
    try {
        const { token } = params;

        const getTokenAccess = await getGodToken(token);

        if (!getTokenAccess) {
            return NextResponse.json({
                valid: false,
            });
        }

        return NextResponse.json({
            valid: true,
            token: getTokenAccess,
        });
    } catch (error) {
        console.log('Error in getting tokek');
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};



