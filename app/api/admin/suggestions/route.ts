import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, day, time } = await req.json();

    if (!userId || !day || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    } else {
      const suggestion = await prisma.suggestions.create({
        data: {
          userId,
          day,
          time,
        },
      });

      return NextResponse.json({ suggestion }, { status: 200 });
    }
  } catch (error) {
    console.error("Error adding suggestion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
