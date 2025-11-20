import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, groupName, cafes, selectedParticipants } = body;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    // 🔒 Prevent double matching
    // const existingMatch = await prisma.matchGroup.findFirst({
    //   where: { eventId },
    // });

    // if (existingMatch) {
    //   return NextResponse.json(
    //     { error: "Matching already done for this event" },
    //     { status: 400 }
    //   );
    // }

    // ✅ Ensure event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // ✅ Create match group
    await prisma.matchGroup.create({
      data: {
        groupName,
        eventId,
        members: selectedParticipants,
        cafeId: cafes,
      },
    });

    // ✅ Update event status
    await prisma.event.update({
      where: { id: eventId },
      data: {
        cafeId: cafes,
      },
    });

    return NextResponse.json(
      { success: true, message: "Group Created Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || undefined;

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch all groups
    const groups = await prisma.matchGroup.findMany({
      where: { eventId },
      include: {
        cafe: {
          select: {
            name: true,
            address: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
