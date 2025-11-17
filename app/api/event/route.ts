import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

function getNextSundays(count: number): Date[] {
  const sundays: Date[] = [];
  const now = new Date();

  let nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  nextSunday.setHours(10, 0, 0, 0); // 10 AM

  for (let i = 0; i < count; i++) {
    const newDate = new Date(nextSunday);
    newDate.setDate(nextSunday.getDate() + i * 7);
    sundays.push(newDate);
  }

  return sundays;
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuthToken(request);

    // Admin check
    if (!auth?.adminId) {
      return NextResponse.json(
        { message: "Only admins can create events" },
        { status: 403 }
      );
    }

    const { city } = await request.json();

    if (!city) {
      return NextResponse.json(
        { message: "City is required" },
        { status: 400 }
      );
    }

    // Find location by city
    const location = await prisma.location.findFirst({
      where: { city: { equals: city, mode: "insensitive" } },
    });

    if (!location) {
      return NextResponse.json(
        { message: "Location for this city not found" },
        { status: 404 }
      );
    }

    const sundays = getNextSundays(4);
    const createdEvents = [];

    for (const sunday of sundays) {
      // Prevent duplicate creation
      const existing = await prisma.event.findFirst({
        where: {
          date: sunday,
          locationId: location.id,
        },
      });

      if (existing) continue;

      // Booking open = 3 weeks before
      const bookingOpen = new Date(sunday);
      bookingOpen.setDate(sunday.getDate() - 21);
      bookingOpen.setHours(10, 0, 0, 0);

      // Booking close = Friday before Sunday
      const bookingClose = new Date(sunday);
      bookingClose.setDate(sunday.getDate() - 2);
      bookingClose.setHours(10, 0, 0, 0);

      const event = await prisma.event.create({
        data: {
          date: sunday,
          city: location.city,
          country: location.country,
          createdBy: auth.adminId,
          locationId: location.id,
          bookingOpen,
          bookingClose,
          status: "Open",
        },
      });

      createdEvents.push(event);
    }

    return NextResponse.json({
      success: true,
      message: `Events created for ${city} for next 4 Sundays`,
      createdCount: createdEvents.length,
      events: createdEvents,
    });
  } catch (err: any) {
    console.error("Event creation error:", err);
    return NextResponse.json(
      { message: "Failed to create events", error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const filterDays = searchParams.get("filterDays");

    const now = new Date();
    const expiredDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const where: any = {
      date: {
        gte: expiredDate,
      },
    };

    if (city) {
      where.city = city;
    }

    if (filterDays) {
      const days = parseInt(filterDays);
      if (!isNaN(days) && days > 0) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        where.date.lte = futureDate;
      }
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        participants: {
          select: {
            userId: true,
            eventId: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            mode: true,
            userId: true,
          },
        },
      },
      orderBy: { date: "asc" },
      take: 4,
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
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
