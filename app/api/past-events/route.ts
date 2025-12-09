import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const pastEvents = await prisma.eventParticipant.findMany({
      where: {
        userId,
        event: {
          date: {
            lt: new Date(),
          },
        },
      },
      include: {
        event: {
          select: {
            date: true,
            cafe: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        event: { date: "desc" },
      },
    });

    return NextResponse.json({ pastEvents }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
