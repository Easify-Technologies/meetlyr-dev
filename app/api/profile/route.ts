'use server';

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const profile = await prisma.user.findUnique({
            where: { 
                email: body.userId 
            },
            include: {
                payment: {
                    select: {
                        status: true,
                        stripeSessionId: true
                    }
                }
            }
        });

        return NextResponse.json(profile);

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}