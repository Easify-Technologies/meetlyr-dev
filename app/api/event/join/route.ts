// import { verifyAuthToken } from "@/lib/auth";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    // const authUser = verifyAuthToken(request);
    // if (!authUser) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    const { userId, eventId } = await request.json();

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { cafe: true },
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
      where: { userId, eventId },
    });

    if (existing) {
      return NextResponse.json(
        { message: "User already joined this event" },
        { status: 400 }
      );
    }

    // Subscription validation
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

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
        subscriptionActive: user.subscriptionCredits - 1 > 0,
      },
    });

    // Add participant
    const participant = await prisma.eventParticipant.create({
      data: { userId, eventId, status: "Active" },
      include: { user: true },
    });

    const formattedDate = new Date(event?.date).toLocaleString("en-US", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });

    // Send joining email
    if (participant.user) {
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <p>Hello ${user?.name} 👋</p>

          <p>
            You’re officially in! Your spot for the meetup on
            <strong>${formattedDate}</strong> has been successfully reserved.
          </p>

          <p>
            We’re excited to have you join us. This event is designed to create relaxed,
            meaningful conversations and genuine human connections.
          </p>

          <p><strong>What happens next</strong></p>

          <p>
            We’re currently finalizing the group to ensure a comfortable and balanced
            experience for everyone. Once matching is complete, you’ll see all updates
            directly in the app.
          </p>

          <p style="font-size: 14px; color: #555;">
            The exact meetup location and venue details will be shared
            <strong>48 hours before the event</strong> and will always be available in
            the app.
          </p>

          <p>
            If you need to cancel, please do so more than 48 hours before the event so
            we have time to invite someone else. After that, the reservation will be
            confirmed and cannot be modified. In case of an extraordinary situation,
            please contact the Meetlyr team.
            <br />
            <strong>IMPORTANT:</strong> cancellations can only be made in the app.
          </p>

          <p>
            You’ve already taken the biggest step by joining. All that’s left is to show
            up and enjoy the experience — we’ll take care of the rest.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: `"Meetlyr" <${process.env.SMTP_USER}>`,
        to: user?.email,
        subject: "Welcome Aboard — Your Meetup Spot Is Reserved ☕",
        html,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Event joined successfully",
      participant,
    });
  } catch (err: any) {
    console.error("Join event error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
