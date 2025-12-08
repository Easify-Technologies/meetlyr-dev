import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const removeEvent = await prisma.event.delete({
            where: {
                id: body.eventId
            }
        });

        return NextResponse.json({ removeEvent, message: "Event deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}