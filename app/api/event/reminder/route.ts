import { NextRequest, NextResponse } from "next/server";
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
    const { to, groupNames, cafe, date } = await req.json();

    const formattedDate = new Date(date).toLocaleString("en-US", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
      timeZone: "Europe/Paris",
    });

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      cafe.address
    )}`;

    const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f6f6; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 24px; line-height: 1.6; color: #2F1107;">

    <p style="font-size: 16px; margin-top: 0;">
      Hello ${groupNames},
    </p>

    <p style="font-size: 16px;">
      This is a friendly reminder about your upcoming coffee meetup scheduled for:
    </p>

    <p style="font-size: 18px; font-weight: bold; margin: 16px 0;">
      ☕ ${formattedDate}
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

    <p style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
      📍 Meetup Location
    </p>

    <p style="margin: 0 0 12px 0;">
      <strong>${cafe.name}</strong>
    </p>

    <p style="margin: 0 0 16px 0;">
      ${cafe.address}
    </p>

    <a
      href="${mapUrl}"
      target="_blank"
      style="
        display: inline-block;
        padding: 10px 16px;
        background-color: #FFD100;
        color: #2F1107;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        margin-bottom: 24px;
      "
    >
      Open in Google Maps
    </a>

    <div style="text-align: center; margin: 32px 0;">
      <a
        href="${process.env.NEXTAUTH_URL}/events"
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
        View Event Details
      </a>
    </div>

    <p style="font-size: 14px; color: #555; margin-bottom: 0;">
      We recommend arriving a few minutes early so you can settle in comfortably.
      Look for a friendly group — our hosts will be there to welcome you.
    </p>

    <p style="font-size: 14px; color: #555;">
      If your plans change, please update your status in the app so others are informed.
    </p>

    <p style="font-size: 14px; color: #999; margin-top: 32px;">
      — Team Meetlyr
    </p>

  </div>
</div>
    `;

    await transporter.sendMail({
      from: `"Meetlyr" <${process.env.SMTP_USER}>`,
      to,
      subject: "Coffee Meetup Reminder ☕",
      html,
    });

    return NextResponse.json({ message: "Reminder emails sent successfully!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
