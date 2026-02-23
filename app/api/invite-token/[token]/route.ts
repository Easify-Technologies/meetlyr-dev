import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 400 }
      );
    }

    const invite = await prisma.eventInvite.findUnique({
      where: { token },
      include: {
        inviter: true,
        event: {
          include: {
            cafe: true,
            participants: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite link" },
        { status: 400 }
      );
    }

    const event = invite.event;

    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }

    if (event.date < new Date()) {
      return NextResponse.json(
        { error: "Event already completed" },
        { status: 400 }
      );
    }

    if (event.isClosed) {
      return NextResponse.json(
        { error: "This event is closed" },
        { status: 400 }
      );
    }

    if (event.bookingClose && new Date() > event.bookingClose) {
      return NextResponse.json(
        { error: "Booking for this event is closed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        event,
        inviterName: invite.inviter.name,
        inviterId: invite.inviter.id,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch invite token" },
      { status: 500 }
    );
  }
}