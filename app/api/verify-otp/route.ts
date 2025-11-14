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
    <div style="font-family: 'Arial', sans-serif; padding: 24px; background-color: #fdfdfd; border-radius: 10px; border: 1px solid #eee; max-width: 540px; margin: 20px auto;">
      <div style="text-align: center; margin-bottom: 28px;">
        <img src="https://meetlyr.com/wp-content/uploads/2025/10/18-e1761649684550.png" alt="Meetlyr Logo" style="width: 120px; height: auto;" />
      </div>

      <h2 style="color: #3c3c3c; font-size: 22px; margin-bottom: 10px; text-align: left;">
        Hi ${storedEmail.name || "there"} 👋
      </h2>

      <p style="color: #555; font-size: 15px; line-height: 1.7; margin-bottom: 12px;">
        Welcome to <strong style="color: #6b4f4f;">Meetlyr</strong>! 🎉 Your email has been successfully verified, and your account is now active. We're thrilled to have you join our growing community of inspiring individuals.
      </p>

      <p style="color: #555; font-size: 15px; line-height: 1.7; margin-bottom: 16px;">
        From spontaneous meetups ☕ to meaningful connections 💬 — Meetlyr is all about bringing people together in the real world. You're now ready to start exploring events, discovering new circles, and creating unforgettable moments.
      </p>

      <div style="background-color: #faf6f4; border: 1px solid #eee; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h3 style="margin: 0 0 8px 0; color: #6b4f4f; font-size: 16px;">Here’s what you can do next:</h3>
        <ul style="padding-left: 20px; margin: 0; color: #555; line-height: 1.6; font-size: 15px;">
          <li>Complete your profile to help others know you better.</li>
          <li>Browse nearby events and join one that excites you.</li>
          <li>Meet people who share your interests and passions.</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://meetlyr.com/" target="_blank" 
          style="display: inline-block; background-color: #6b4f4f; color: #fff; text-decoration: none; font-size: 16px; padding: 14px 28px; border-radius: 50px; font-weight: 600;">
          🚀 Get Started on Meetlyr
        </a>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 28px; text-align: center; line-height: 1.6;">
        Need help or have questions? Visit our 
        <a href="https://meetlyr.com/how-it-works/" style="color: #6b4f4f; text-decoration: none; font-weight: bold;">Help Center</a> — we’re always here for you.
      </p>

      <p style="color: #333; font-size: 15px; margin-top: 30px; text-align: center;">
        With warmth,<br/>
        <strong>The Meetlyr Team ☕</strong>
      </p>
    </div>
    `;

    const registeredMessage = await transporter.sendMail({
      from: `"Meetlyr" <${process.env.SMTP_USER}>`,
      to: storedEmail,
      subject: "Welcome to Meetlyr, Your Email’s Verified and You’re All Set to Connect ☕",
      html,
    });

    if (registeredMessage.accepted && registeredMessage.accepted.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Registration successful",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Email could not be sent. Please try again later." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
