import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendMeetupEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { eventId, groupSize = 4 } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    // 🔒 Check if event is already matched
    const existingMatch = await prisma.matchGroup.findFirst({
      where: { eventId },
    });

    if (existingMatch) {
      return NextResponse.json(
        { error: "Matching already done for this event" },
        { status: 400 }
      );
    }

    // ✅ Fetch event with participants and cafe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: { 
          include: { user: true },
          where: { status: "Active" } // Only active participants
        },
        cafe: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const participants = event.participants.map(p => p.user);

    if (!participants.length) {
      return NextResponse.json({ error: "No participants found" }, { status: 400 });
    }

    // ✅ Find or reuse the cafe
    const cafe = event.cafe || (await prisma.cafe.findFirst({
      where: { locationId: event.locationId ?? undefined },
    }));

    if (!cafe) {
      return NextResponse.json({ error: "No cafe found for this event" }, { status: 400 });
    }

    // ✅ Create multiple groups if needed
    const groups = [];
    for (let i = 0; i < participants.length; i += groupSize) {
      const groupMembers = participants.slice(i, i + groupSize);
      const group = await prisma.matchGroup.create({
        data: {
          eventId,
          members: groupMembers.map(p => p.id),
          cafeId: cafe.id,
          groupNumber: Math.floor(i / groupSize) + 1,
        },
      });
      groups.push(group);
    }

    // ✅ Mark event as closed/matched
    await prisma.event.update({
      where: { id: eventId },
      data: {
        cafeId: cafe.id,
        isClosed: true,
        status: "Matched",
      },
    });

    // ✅ Send email to all participants with their group info
    for (let i = 0; i < participants.length; i++) {
      const user = participants[i];
      const groupIndex = Math.floor(i / groupSize);
      const groupNumber = groupIndex + 1;
      
      await sendMeetupEmail({
        to: user.email,
        groupNames: user.name,
        date: event.date.toISOString(),
        cafe: {
          name: cafe.name,
          address: cafe.address,
        },
        groupNumber: groupNumber,
        totalGroups: groups.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Participants matched successfully and emails sent",
      totalGroups: groups.length,
      cafe: cafe.name,
      totalParticipants: participants.length,
      groups,
    });
  } catch (err: any) {
    console.error("Manual match error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}