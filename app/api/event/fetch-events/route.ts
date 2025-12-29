import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },   // removed city sorting for safety
      include: {
        cafe: {
          select: { name: true },
        },
        admin: {
          select: { email: true },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                oneLiner: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("❌ Error fetching events:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
