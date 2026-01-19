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
    }
    else {
      const suggestion = await prisma.suggestions.create({
        data: {
          userId,
          day,
          time,
        },
      });

      return NextResponse.json({ message: "Suggestion added successfully", suggestion }, { status: 200 });
    }
  } catch (error) {
    console.error("Error adding suggestion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
    try {
        const suggestions = await prisma.suggestions.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ suggestions }, { status: 200 });
    } catch (error) {
        console.error("Error fetching suggestions: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}