import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId, eventId } = await req.json();

        const freePayment = await prisma.payment.create({
            data: {
                userId,
                eventId,
                stripeSessionId: "free-pass",
                mode: "free",
                status: "paid"
            }
        });

        if(freePayment) {
            await prisma.eventParticipant.create({
                data: {
                    userId,
                    eventId
                }
            });

            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    freePass: false,
                    freePassUsedAt: new Date()
                }
            });

            return NextResponse.json({ message: "Free pass applied successfully" }, { status: 200 });
        }

    } catch (error) {
        console.error("Error processing free pass request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}