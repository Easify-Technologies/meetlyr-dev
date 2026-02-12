import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      eventId,
      userId,
      cafeId,
      overallRating,
      cafeRating,
      foodRating,
      serviceRating,
      atmosphereRating,
      participantFeedback,
    } = body;

    if (!Array.isArray(participantFeedback)) {
      return NextResponse.json(
        { error: "Invalid participant feedback" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const existingFeedback = await prisma.feedback.findFirst({
      where: { userId, eventId },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "Feedback already submitted for this event" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        eventId,
        cafeId,
        overallRating,
        cafeRating,
        foodRating,
        serviceRating,
        atmosphereRating,
        participantFeedback: {
          create: participantFeedback.map(p => ({
            participantId: p.participantId,
            rating: p.rating,
            present: p.present,
          })),
        },
      },
    });

    if (user?.email) {
      const html = `
        <p style="font-size:16px;">Hey ${user.name} 👋</p>
        <p style="font-size:16px;">
          Thanks for sharing your feedback 💛 It really helps us improve every meetup.
        </p>
        <div style="margin:32px 0;text-align:center;">
          <a href="${process.env.NEXTAUTH_URL}/bookings"
             style="padding:14px 30px;background:#2F1107;color:#fff;
                    border-radius:999px;text-decoration:none;font-weight:600;">
            Book Your Next Event 🚀
          </a>
        </div>
        <p style="font-size:14px;color:#999;">
          — Team Meetlyr
        </p>
      `;

      await transporter.sendMail({
        from: `"Meetlyr" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Thank you for your feedback 🙌",
        html,
      });
    }

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully", feedback },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 }
    );
  }
}
