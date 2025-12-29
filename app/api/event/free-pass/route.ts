import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, eventId } = await req.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: "Missing userId or eventId" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { freePass: true },
      });

      if (!user?.freePass) {
        throw new Error("Free pass already used");
      }

      const existingParticipant = await tx.eventParticipant.findFirst({
        where: { userId, eventId },
      });

      if (existingParticipant) {
        throw new Error("User already joined this event");
      }

      await tx.payment.create({
        data: {
          userId,
          eventId,
          stripeSessionId: `free-pass-${userId}-${eventId}`,
          mode: "free",
          status: "paid",
        },
      });

      await tx.eventParticipant.create({
        data: {
          userId,
          eventId,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          freePass: false,
          freePassUsedAt: new Date(),
        },
      });
    });

    return NextResponse.json(
      { message: "Free pass applied successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing free pass request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 400 }
    );
  }
}
