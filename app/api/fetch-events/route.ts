// import prisma from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
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
              },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
