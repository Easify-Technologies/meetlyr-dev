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
      participantRating,
      atmosphereRating,
    } = body;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        userId,
        eventId,
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "Feedback already submitted for this event" },
        { status: 400 },
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        eventId,
        cafeId,
        cafeRating,
        overallRating,
        foodRating,
        serviceRating,
        participantRating,
        atmosphereRating,
      },
    });

    if (feedback) {
      const html = `
        <p style="font-size: 16px; margin-top: 0;"> Hey ${user?.name} 👋 </p> 
        <p style="font-size: 16px;"> Thanks a ton for sharing your feedback — we really appreciate you taking the time 💛 </p> 
        <p style="font-size: 16px;"> Your thoughts help us make our meetups better, smoother, and more fun. We actually read every response (promise 👀). </p> 
        <p style="font-size: 16px;"> If you’re up for it, we’d love to have you join us again and meet some new faces ☕✨ </p> 
        <div style="text-align: center; margin: 32px 0;"> 
          <a href="${process.env.NEXTAUTH_URL}/bookings" target="_blank" style=" display: inline-block; padding: 14px 30px; background-color: #2F1107; color: #ffffff; border-radius: 999px; text-decoration: none; font-size: 16px; font-weight: 600; " > Book Your Next Event 🚀 </a> 
        </div>
        <p style="font-size: 14px; color: #555;"> More events, more vibes, more great conversations — we’ll see you soon 👋 </p> 
        <p style="font-size: 14px; color: #999; margin-top: 32px;"> Much love,<br /> — Team Meetlyr </p>
      `;

      await transporter.sendMail({
        from: `"Meetlyr" <${process.env.SMTP_USER}>`,
        to: user?.email ?? "",
        subject: "Thank you for your feedback 🙌",
        html,
      });

      return NextResponse.json(
        { success: true, feedback, message: "Feedback submitted successfully" },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 },
    );
  }
}
