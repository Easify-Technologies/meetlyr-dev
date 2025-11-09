import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { city, country } = body.data;

    const location = await prisma.user.update({
      where: {
        id: body.userId,
      },
      data: {
        city,
        country,
      },
    });

    return NextResponse.json(
      { message: "Location updated successfully", location },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 }
    );
  }
}
