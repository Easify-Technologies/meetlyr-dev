import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, eventId } = await req.json();
    const token = crypto.randomBytes(24).toString("hex");

    const participant = await prisma.eventParticipant.create({
      data: {
        userId,
        eventId,
        joinedAt: new Date(),
      },
    });
    
    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        }
    });

    if(!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 400 });
    }

    await prisma.payment.create({
      data: {
        userId,
        eventId,
        mode: "free",
        status: "paid",
        stripeSessionId: `free-${userId}-${eventId}`,
        createdAt: new Date(),
      },
    });

    await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        inviteToken: token,
        inviteEnabled: true,
        inviteExpires: new Date(event.date.getTime() - 6 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json(
      { success: true, message: "Participant added successfully", participant },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 },
    );
  }
}
