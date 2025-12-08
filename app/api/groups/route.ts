import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const groups = await prisma.matchGroup.findMany({
      where: { eventId },
      include: {
        cafe: {
          select: { name: true, address: true, imageUrl: true },
        },
      },
    });

    const finalGroups = [];

    for (const group of groups) {
      const participantRecords = await prisma.eventParticipant.findMany({
        where: {
          id: {
            in: group.members.map(id => id),
          },
        },
        select: { userId: true },
      });

      const userIds = participantRecords
        .map(p => p.userId)
        .filter((u): u is string => u != null);

      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          city: true,
          country: true,
          gender: true,
          oneLiner: true,
        },
      });

      finalGroups.push({
        ...group,
        members: users,
      });
    }

    return NextResponse.json(finalGroups, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
