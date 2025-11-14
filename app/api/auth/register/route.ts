import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { addMinutes } from "date-fns";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .slice(0, length);
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    // --- Extract all form fields ---
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const phoneNumber = form.get("phoneNumber") as string;
    const gender = form.get("gender") as string;
    const dateOfBirth = form.get("dateOfBirth") as string;
    const cafe_id = form.get("cafe_id") as string;
    const city_id = form.get("city_id") as string;
    const oneLiner = form.get("oneLiner") as string;
    const connectionStyle = form.get("connectionStyle") as string;
    const communicationStyle = form.get("communicationStyle") as string;
    const socialStyle = form.get("socialStyle") as string;
    const healthFitnessStyle = form.get("healthFitnessStyle") as string;
    const family = form.get("family") as string;
    const spirituality = form.get("spirituality") as string;
    const politicsNews = form.get("politicsNews") as string;
    const humor = form.get("humor") as string;
    const password = form.get("password") as string;
    const peopleType = JSON.parse(form.get("peopleType") as string);
    const avatarFile = form.get("avatar") as string;

    console.log("Received avatar:", form.get("avatar"));

    const today = new Date();
    const dob = new Date(dateOfBirth);
    const age = today.getFullYear() - dob.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    const finalAge = hasBirthdayPassed ? age : age - 1;

    // --- Validation ---
    if (
      !name ||
      !email ||
      !phoneNumber ||
      !gender ||
      !oneLiner ||
      !avatarFile ||
      !dateOfBirth ||
      !cafe_id ||
      !city_id ||
      !connectionStyle ||
      !communicationStyle ||
      !socialStyle ||
      !healthFitnessStyle ||
      !family ||
      !spirituality ||
      !politicsNews ||
      !humor ||
      !peopleType ||
      !password
    ) {
      return NextResponse.json(
        { error: "All fields are required", isLoggedIn: false },
        { status: 400 }
      );
    }

    // --- Check existing user ---
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    if (finalAge < 18) {
      return NextResponse.json(
        { error: "You must be at least 18 years old to register." },
        { status: 400 }
      );
    }

    // --- Fetch city info ---
    const getCity = await prisma.location.findUnique({
      where: { id: city_id },
      select: { city: true, country: true },
    });

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Create user ---
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        gender,
        avatar: avatarFile,
        dateOfBirth,
        country: getCity?.country || "",
        city: getCity?.city || "",
        oneLiner,
        connectionStyles: connectionStyle,
        communicationStyles: communicationStyle,
        socialStyles: socialStyle,
        healthAndFitness: healthFitnessStyle,
        family,
        spirituality,
        politicalNews: politicsNews,
        incorrectHumor: humor,
        kindOfPeople: peopleType,
        password: hashedPassword,
        isLoggedIn: true,
      },
    });

    // --- Generate JWT ---
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    const otp = generateOTP();
    const expiresAt = addMinutes(new Date(), 10);

    (await cookies()).set(
      "email_otp",
      JSON.stringify({ email, otp, expiresAt }),
      {
        httpOnly: true,
        secure: true,
        maxAge: 10 * 60,
        sameSite: "strict",
        path: "/",
      }
    );

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fafafa; border-radius: 8px; border: 1px solid #eee; max-width: 500px; margin: auto;">
          <h2 style="color: #6b4f4f;">🔐 Verify Your Email Address</h2>
          <p>Hey ${name || "there"},</p>
          <p>Thank you for signing up with <strong>Meetlyr</strong>!</p>
          <p>To complete your verification, please use the One-Time Password (OTP) below:</p>
  
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; background-color: #6b4f4f; color: #fff; font-size: 24px; letter-spacing: 6px; padding: 12px 24px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
  
          <p>This OTP is valid for the next <strong>10 minutes</strong>. Please do not share it with anyone.</p>
          <p>If you didn’t request this verification, you can safely ignore this email.</p>
          <p>— The Meetlyr Team ☕</p>
        </div>
      `;

    const verification = await transporter.sendMail({
      from: `"Meetlyr" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Email Verification ☕",
      html,
    });

    if (verification) {
      return NextResponse.json(
        {
          success: true,
          message: "User created successfully",
          userId: user.id,
          token,
          isLoggedIn: true,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Email could not be sent" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 }
    );
  }
}
