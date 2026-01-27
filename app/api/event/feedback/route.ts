import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
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

export async function POST(req: NextRequest) {
  try {
    const { eventId, cafe, date } = await req.json();

    const group = await prisma.matchGroup.findFirst({
      where: { eventId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const participants = await prisma.eventParticipant.findMany({
      where: { id: { in: group.members } },
      include: { user: true },
    });

    for (const p of participants) {
      const html = `<div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f6f6; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 24px; line-height: 1.6; color: #2F1107;">

    <p style="font-size: 16px; margin-top: 0;">
      Hi ${p.user?.name},
    </p>

    <p style="font-size: 16px;">
      Thank you for being part of our recent coffee meetup ☕  
      We hope you enjoyed the experience and made some meaningful connections.
    </p>

    <p style="font-size: 16px;">
      Your feedback is incredibly valuable to us. It helps us understand what worked well
      and where we can improve future meetups.
    </p>

    <p style="font-size: 16px;">
      The feedback form is short and should take no more than a minute to complete.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a
        href="${process.env.NEXTAUTH_URL}/event"
        target="_blank"
        style="
          display: inline-block;
          padding: 14px 28px;
          background-color: #2F1107;
          color: #ffffff;
          border-radius: 8px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
        "
      >
        Share Your Feedback
      </a>
    </div>

    <p style="font-size: 14px; color: #555;">
      Whether your experience was great or there’s something we could do better,
      we genuinely appreciate hearing from you.
    </p>

    <p style="font-size: 14px; color: #555;">
      Thanks again for being part of the Meetlyr community.
    </p>

    <p style="font-size: 14px; color: #999; margin-top: 32px;">
      — Team Meetlyr
    </p>

  </div>
</div>
`;

      await transporter.sendMail({
        from: `"Meetlyr" <${process.env.SMTP_USER}>`,
        to: p.user?.email ?? "",
        subject: "Feedback Request ☕",
        html,
      });
    }

    return NextResponse.json(
      { message: "Reminder emails sent successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
