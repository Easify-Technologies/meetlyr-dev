import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventId, mode } = body;

    if (mode === "subscription") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      if (!user.subscriptionActive) {
        return NextResponse.json(
          { message: "No active subscription" },
          { status: 403 }
        );
      }

      const deleteParticipant = await prisma.eventParticipant.deleteMany({
        where: {
          userId,
          eventId,
        },
      });

      if (deleteParticipant.count > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionCredits: {
              increment: 1,
            },
          },
        });
      }

      return NextResponse.json(
        {
          message: "Event cancelled successfully",
          restoredCredits: deleteParticipant.count > 0 ? 1 : 0,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Invalid cancellation mode" },
      { status: 400 }
    );

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
