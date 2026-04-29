import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session.user.email;

    const { phoneNumber, dateOfBirth, gender } = await req.json();

    if (!phoneNumber)
      return NextResponse.json(
        { error: "Phone Number is required" },
        { status: 400 },
      );
    if (!dateOfBirth)
      return NextResponse.json(
        { error: "Date of birth is required" },
        { status: 400 },
      );
    if (!gender)
      return NextResponse.json(
        { error: "Gender Number is required" },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateDetails = await prisma.user.update({
      where: {
        email,
      },
      data: {
        phoneNumber,
        dateOfBirth,
        gender,
      },
    });

    return NextResponse.json(
      { message: "Personal Details updated successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
