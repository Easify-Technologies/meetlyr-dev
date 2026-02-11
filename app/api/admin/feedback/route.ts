import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const feedback = await prisma.feedback.findMany({
      where: {
        user: {
          is: {
            id: { not: undefined }
          }
        }
      },
      include: {
        user: { select: { name: true } },
        event: { select: { date: true } },
        cafe: { select: { name: true } },
        participantFeedback: {
          select: {
            rating: true,
            present: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, feedback }, { status: 200 });
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
