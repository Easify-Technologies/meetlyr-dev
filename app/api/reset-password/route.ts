"use server";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
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
    const { password, confirm_password } = body;

    if (!password || !confirm_password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirm_password) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cookie = cookieStore.get("forgot_password_token");

    if (!cookie) {
      return NextResponse.json(
        { error: "Forgot Password token is missing" },
        { status: 400 }
      );
    }

    const { email: storedEmail, expiresAt } = JSON.parse(cookie.value);

    if (new Date(expiresAt) < new Date()) {
      cookieStore.delete("forgot_password_token");
      return NextResponse.json(
        { error: "Reset link expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: storedEmail },
      data: { password: hashedPassword },
    });

    cookieStore.delete("forgot_password_token");

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fafafa; border-radius: 8px; border: 1px solid #eee; max-width: 500px; margin: auto;">
        <h2 style="color: #6b4f4f;">🔑 Password Updated Successfully</h2>
        <p>Hey ${storedEmail.name || "there"},</p>

        <p>We wanted to let you know that your <strong>Meetlyr</strong> account password was successfully updated.</p>

        <p>Stay secure,<br>— The Meetlyr Team ☕</p>
      </div>
    `;

    const verification = await transporter.sendMail({
      from: `"Meetlyr" <${process.env.SMTP_USER}>`,
      to: storedEmail,
      subject: "✅ Your Password Has Been Updated Successfully",
      html,
    });

    if (verification) {
      return NextResponse.json({ message: "Password updated successfully" });
    } else {
      return NextResponse.json(
        { error: "Email could not be sent" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
