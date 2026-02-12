import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId, eventId } = await req.json();

        const specialParticipant = await prisma.eventParticipant.create({
            data: {
                userId,
                eventId
            }
        });

        await prisma.payment.create({
            data: {
                userId,
                eventId,
                stripeSessionId: `special-pass-${userId}-${eventId}`,
                mode: "special",
                status: "paid"
            }
        });

        return NextResponse.json({ success: true, specialParticipant, message: "Successfully joined the event!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 400 });
    }
}
