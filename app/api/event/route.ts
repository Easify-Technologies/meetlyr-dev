import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

// Helper: Get next N Sundays at 10 AM
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

    // ✅ Ensure only admins can create events
    if (!auth?.adminId) {
      return NextResponse.json(
        { message: "Only admins can create events" },
        { status: 403 }
      );
    }

    const adminId = auth.adminId;
    const body = await request.json();
    
    // Get the selected location and cafe from request body
    const { locationId, cafeId, numberOfWeeks = 4 } = body;

    if (!locationId) {
      return NextResponse.json(
        { message: "Location ID is required" },
        { status: 400 }
      );
    }

    // Fetch the specific location
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      return NextResponse.json(
        { message: "Location not found" },
        { status: 404 }
      );
    }

    // If cafeId is provided, validate it belongs to the location
    let cafe = null;
    if (cafeId) {
      cafe = await prisma.cafe.findFirst({
        where: {
          id: cafeId,
          locationId: locationId
        }
      });

      if (!cafe) {
        return NextResponse.json(
          { message: "Cafe not found in the selected location" },
          { status: 400 }
        );
      }
    }

    const sundays = getNextSundays(numberOfWeeks);
    const createdEvents = [];

    for (const sunday of sundays) {
      // Check for existing event to avoid duplicates
      const existing = await prisma.event.findFirst({
        where: {
          date: sunday,
          locationId: location.id,
          ...(cafeId && { cafeId: cafeId }) // Also check cafe if provided
        },
      });

      if (existing) continue;

      // ✅ Booking opens 3 weeks before the event
      const bookingOpen = new Date(sunday);
      bookingOpen.setDate(sunday.getDate() - 21);
      bookingOpen.setHours(10, 0, 0, 0);

      // ✅ Booking closes Friday 10 AM before the Sunday event
      const bookingClose = new Date(sunday);
      bookingClose.setDate(sunday.getDate() - 2); // Friday before Sunday
      bookingClose.setHours(10, 0, 0, 0);

      // ✅ Create the event data
      const eventData: any = {
        date: sunday,
        city: location.city,
        country: location.country,
        createdBy: adminId,
        locationId: location.id,
        bookingOpen,
        bookingClose,
        status: "Open",
      };

      // Add cafeId if provided
      if (cafeId) {
        eventData.cafeId = cafeId;
      }

      // ✅ Create the event
      const event = await prisma.event.create({
        data: eventData,
      });

      createdEvents.push(event);
    }

    return NextResponse.json({
      success: true,
      message: `Events created for ${location.city}, ${location.country}${cafe ? ` at ${cafe.name}` : ''} for next ${numberOfWeeks} Sundays`,
      createdCount: createdEvents.length,
      events: createdEvents,
    });
  } catch (err: any) {
    console.error("Error creating events:", err);
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
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            mode: true,
            userId: true
          }
        }
      },
      orderBy: { date: "asc" },
      take: 4
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
