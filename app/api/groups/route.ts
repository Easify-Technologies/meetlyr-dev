import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    // Fetch match group
    const match = await prisma.matchGroup.findFirst({
      where: { eventId },
      include: { cafe: true },
    });

    if (!match) {
      return NextResponse.json({ groups: [] });
    }

    // Fetch full user details for the member IDs
    const members = await prisma.user.findMany({
      where: { id: { in: match.members } },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        city: true,
        country: true,
        oneLiner: true,
      },
    });

    return NextResponse.json({
      groups: [
        {
          id: match.id,
          cafe: match.cafe,
          members,
        },
      ],
    });
  } catch (err: any) {
    console.error("GET match-group error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
