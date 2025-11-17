import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: [
        { city: "asc" },
        { date: "asc" }
      ],
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        },
        cafe: {
          select: {
            name: true,
            address: true,
            imageUrl: true
          }
        },
        location: {
          select: {
            city: true,
            country: true
          }
        }
      },
      where: {
        date: {
          gte: new Date()
        }
      }
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error("Fetch events error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch events",
        error: error.message,
      },
      { status: 500 }
    );
  }
}