import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const pastEvents = await prisma.eventParticipant.findMany({
      where: {
        userId,
        event: {
          date: { lt: new Date() },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            date: true,
            cafe: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            matchGroups: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        event: { date: "desc" },
      },
      take: 3,
    });

    const feedbacks = await prisma.feedback.findMany({
      where: { userId },
      select: { eventId: true },
    });

    const feedbackEventIds = new Set(feedbacks.map(f => f.eventId));

    const participantIds = pastEvents.flatMap(p =>
      p.event.matchGroups.flatMap(g => g.members),
    );

    const uniqueParticipantIds = [...new Set(participantIds)];

    const participantsWithUsers = await prisma.eventParticipant.findMany({
      where: {
        id: { in: uniqueParticipantIds },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const participantUserMap = new Map(
      participantsWithUsers.map(p => [p.id, p.user]),
    );

    const enrichedPastEvents = pastEvents.map(p => ({
      ...p,
      hasSubmittedFeedback: feedbackEventIds.has(p.event.id),
      event: {
        ...p.event,
        matchGroups: p.event.matchGroups.map(g => ({
          users: g.members
            .map(id => participantUserMap.get(id))
            .filter(u => u && u.id !== userId),
        })),
      },
    }));

    return NextResponse.json(
      { pastEvents: enrichedPastEvents },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
