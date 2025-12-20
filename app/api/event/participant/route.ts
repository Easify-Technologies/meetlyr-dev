import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { city: true, country: true },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const participantEvents = await prisma.eventParticipant.findMany({
      where: {
        userId,
        event: {
          city: { equals: user.city, mode: "insensitive" },
          country: { equals: user.country, mode: "insensitive" },
        },
      },
      include: {
        event: {
          include: {
            cafe: {
              select: { id: true, name: true, address: true, imageUrl: true },
            },
            matchGroups: true,
          },
        },
        user: {
          select: {
            payment: {
              select: { mode: true, status: true, stripeSessionId: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Events Found", participantEvents },
      { status: 200 }
    );
  } catch (error) {
    console.error("Event fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
