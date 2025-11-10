import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const participant = await prisma.eventParticipant.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            cafe: {
              select: {
                id: true,
                name: true,
                location: {
                  select: {
                    city: true,
                    country: true,
                  },
                },
                address: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Events Found", participant },
      { status: 200 }
    );
  } catch (error) {
    console.error("Event fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
