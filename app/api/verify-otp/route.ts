import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otp } = body;

    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    const cookie = (await cookies()).get("email_otp");
    if (!cookie) {
      return NextResponse.json(
        { error: "OTP expired or missing" },
        { status: 400 }
      );
    }

    const {
      email: storedEmail,
      otp: storedOtp,
      expiresAt,
    } = JSON.parse(cookie.value);

    if (new Date(expiresAt) < new Date()) {
      (await cookies()).delete("email_otp");
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (storedOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    (await cookies()).delete("email_otp");
    await prisma.user.update({
      where: { email: storedEmail },
      data: { isVerified: true },
    });

    const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #fdfdfd; border-radius: 8px; border: 1px solid #eee; max-width: 520px; margin: 20px auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="/Mocha-e1760632297719.webp" alt="Meetlyr Logo" style="width: 120px; height: auto;" />
      </div>

      <h2 style="color: #3c3c3c; font-size: 20px; margin-bottom: 12px;">Hi ${
        storedEmail.name || "there"
      } 👋</h2>

      <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 12px;">
        Welcome to <strong>Meetlyr</strong>! 🎉 Your email has been successfully verified, and your account is now active.
      </p>

      <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 12px;">
        You’re all set to start connecting with amazing people through Meetlyr. Check out the app to view your upcoming events, join conversations, and make meaningful connections.
      </p>

      <div style="background-color: #faf6f4; border: 1px solid #eee; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px 0; color: #6b4f4f;">Next Steps:</h3>
        <ul style="padding-left: 20px; margin: 0; color: #555;">
          <li>Open the Meetlyr app or website.</li>
          <li>Complete your profile for better matches.</li>
          <li>Join or explore nearby events.</li>
        </ul>
      </div>

      <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 12px;">
        If you have any questions, visit our <a href="https://meetlyr.com/help" style="color: #6b4f4f; text-decoration: none; font-weight: bold;">Help Center</a> — we’re always happy to assist.
      </p>

      <p style="color: #333; font-size: 15px; margin-top: 24px;">
        See you soon,<br/>
        <strong>The Meetlyr Team ☕</strong>
      </p>
    </div>
    `;

    const registeredMessage = await transporter.sendMail({
      from: `"Meetlyr" <${process.env.SMTP_USER}>`,
      to: storedEmail,
      subject: "🎉 Welcome to Meetlyr – Your Email Has Been Verified!",
      html,
    });

    if(registeredMessage) {
      return NextResponse.json({ message: "Registration successful! A confirmation email has been sent to your inbox." }, { status: 200 });
    }
    else {
      return NextResponse.json(
      { error: "Email cannot be sent. Please try again later." },
      { status: 500 }
    );
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
