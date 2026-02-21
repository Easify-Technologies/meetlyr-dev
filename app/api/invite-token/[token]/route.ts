import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: {
        inviteToken: token,
        inviteEnabled: true,
      },
      include: {
        cafe: true,
        participants: true,
      },
    });

    if (!event)
      return NextResponse.json(
        { error: "Invalid invite token" },
        { status: 400 }
      );

    if (event.date < new Date())
      return NextResponse.json(
        { error: "This invite token has expired" },
        { status: 400 }
      );

    if (event.isClosed)
      return NextResponse.json(
        { error: "This event is closed" },
        { status: 400 }
      );

    if (event.bookingClose && new Date() > event.bookingClose)
      return NextResponse.json(
        { error: "Booking for this event is closed" },
        { status: 400 }
      );

    return NextResponse.json({ event }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch invite token" },
      { status: 500 }
    );
  }
}