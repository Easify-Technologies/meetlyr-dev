import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email)
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!password)
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return NextResponse.json(
        { error: "This email address does not exist" },
        { status: 400 },
      );
    if (!user.password)
      return NextResponse.json(
        { error: "This account uses Google sign-in" },
        { status: 400 },
      );

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 },
      );

    return NextResponse.json(
      { message: "Logged in successfully!", success: true },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 },
    );
  }
}
