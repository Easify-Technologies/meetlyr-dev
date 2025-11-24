import { NextResponse } from "next/server";
import { sendMeetupEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { eventId, cafe, date } = await req.json();

    if (!eventId || !cafe || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const group = await prisma.matchGroup.findFirst({
      where: { eventId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Convert eventParticipant IDs → user details
    const participants = await prisma.eventParticipant.findMany({
      where: { id: { in: group.members } },
      include: { user: true }
    });

    // Send individual emails (skip participants without a linked user)
    for (const p of participants) {
      if (!p.user || !p.user.email) {
        console.log("Skipping participant without user or email:", p.id);
        continue;
      }
      await sendMeetupEmail({
        to: p.user.email,
        groupNames: p.user.name ?? "",
        cafe,
        date,
      });
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { isClosed: true, status: "Matched" },
    });

    return NextResponse.json(
      { success: true, message: "Emails sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending meetup email:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
