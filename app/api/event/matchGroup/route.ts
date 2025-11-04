import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMeetupEmail } from "@/lib/mailer";
import { formEventGroups } from "@/lib/matchGroup";

export async function GET() {
  try {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // 🧭 1. Find all upcoming events within 48h that are open
    const events = await prisma.event.findMany({
      where: {
        date: { lte: in48h, gte: now },
        isClosed: false,
      },
      include: {
        cafe: true,
        participants: {
          include: { user: true },
        },
      },
    });

    if (events.length === 0) {
      return NextResponse.json({ message: "No events pending matching" });
    }

    const allEventGroups: any[] = [];

    for (const event of events) {
      const existingGroups = await prisma.matchGroup.findMany({
        where: { eventId: event.id },
      });

      if (existingGroups.length > 0) {
        console.log(`Skipping event ${event.id}, already matched.`);
        continue;
      }

      const participants = event.participants.map((p) => p.user);
      if (participants.length === 0) {
        console.log(`Skipping event ${event.id}, no participants.`);
        continue;
      }

      // ☕ Find or assign café
      let cafe = event.cafe;
      if (!cafe) {
        cafe = await prisma.cafe.findFirst({
          where: { location: { city: event.city } },
        });

        if (cafe) {
          await prisma.event.update({
            where: { id: event.id },
            data: { cafeId: cafe.id },
          });
        }
      }

      if (!cafe) {
        console.log(`No cafe found for event ${event.id}. Skipping.`);
        continue;
      }

      // 👥 Form groups
      const groups = await formEventGroups(event.id, cafe.id);

      // 📦 Save the match group data
      await prisma.matchGroup.createMany({
        data: groups.map((group) => ({
          eventId: event.id,
          members: group.map((u) => u.id),
          cafeId: cafe.id,
        })),
      });

      // 📬 Send email to each group
      for (const group of groups) {
        const to = group.map((u) => u.email);
        const groupNames = group.map((u) => u.name).join(", ");

        await sendMeetupEmail({
          to,
          groupNames,
          date: event.date.toISOString(),
          cafe: {
            name: cafe.name,
            address: cafe.address || "Address will be shared soon",
          },
        });
      }

      // 🏁 Mark event as matched
      await prisma.event.update({
        where: { id: event.id },
        data: {
          isClosed: true,
          status: "Matched",
        },
      });

      allEventGroups.push({
        eventId: event.id,
        date: event.date,
        city: event.city,
        cafe: { id: cafe.id, name: cafe.name },
        totalGroups: groups.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Auto-matching completed and emails sent",
      eventGroups: allEventGroups,
    });
  } catch (err: any) {
    console.error("Auto match error:", err);
    return NextResponse.json(
      { error: "Failed to auto match events", details: err.message },
      { status: 500 }
    );
  }
}
