import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [validUserIds, validEventIds, validCafeIds] = await Promise.all([
      prisma.user.findMany({ select: { id: true } }),
      prisma.event.findMany({ select: { id: true } }),
      prisma.cafe.findMany({ select: { id: true } })
    ]);

    const feedback = await prisma.feedback.findMany({
      where: {
        userId: { in: validUserIds.map(u => u.id) },
        eventId: { in: validEventIds.map(e => e.id) },
        cafeId: { in: validCafeIds.map(c => c.id) }
      },
      include: {
        user: { select: { name: true } },
        event: { select: { date: true } },
        cafe: { select: { name: true } }
      }
    });
    
    return NextResponse.json(
      { feedback, message: "Feedback fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
