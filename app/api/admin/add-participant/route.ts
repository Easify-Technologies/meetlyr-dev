import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId, eventId } = await req.json();

        const participant = await prisma.eventParticipant.create({
            data: {
                userId,
                eventId,
                joinedAt: new Date()
            }
        });

        return NextResponse.json({ success: true, message: "Participant added successfully", participant }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 400 });
    }
}