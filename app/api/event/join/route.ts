import { verifyAuthToken } from "@/lib/auth";
import { sendMeetupEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authUser = verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, eventId } = await request.json();

    // Validate event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { cafe: true }
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Booking window validation
    const now = new Date();
    const diffHrs = (new Date(event.date).getTime() - now.getTime()) / 3600000;

    if (diffHrs < 48 || (event.bookingClose && now > event.bookingClose)) {
      return NextResponse.json(
        { message: "Booking closed for this event" },
        { status: 400 }
      );
    }

    // Check if user already joined
    const existing = await prisma.eventParticipant.findFirst({
      where: { userId, eventId }
    });

    if (existing) {
      return NextResponse.json(
        { message: "User already joined this event" },
        { status: 400 }
      );
    }

    // Subscription validation
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (!user.subscriptionActive || user.subscriptionCredits <= 0) {
      return NextResponse.json(
        { message: "No active subscription or credits. Please pay." },
        { status: 400 }
      );
    }

    // Deduct credit
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionCredits: user.subscriptionCredits - 1,
        subscriptionActive: user.subscriptionCredits - 1 > 0
      }
    });

    // Add participant
    const participant = await prisma.eventParticipant.create({
      data: { userId, eventId, status: "Active" },
      include: { user: true }
    });

    // Send joining email
    await sendMeetupEmail({
      to: participant.user.email,
      groupNames: participant.user.name,
      date: event.date.toISOString(),
      cafe: {
        name: event.cafe?.name || "Cafe",
        address: event.cafe?.address || "Address not available"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Event joined successfully",
      participant
    });
  } catch (err: any) {
    console.error("Join event error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
