import { NextResponse } from 'next/server';

import { getSession } from '@/data-access/session';

export async function GET(
    req: Request,
    { params }: { params: { sessionID: string } }
) {
    const { sessionID } = params;
    const sessionExists = await getSession(sessionID);

    if (!sessionExists) {
        return NextResponse.json({
            valid: false,
        });
    }

    return NextResponse.json({
        valid: true,
    });
}
