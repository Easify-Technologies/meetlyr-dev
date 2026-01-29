import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuthToken(request);

    if (!auth?.adminId) {
      return NextResponse.json(
        { message: "Only admins can create events" },
        { status: 403 }
      );
    }

    // Expect frontend to send: city, country, locationId, date (ISO), optional time
    const { city, country, locationId, date } = await request.json();

    if (!city || !country || !locationId || !date) {
      return NextResponse.json(
        { message: "city, country, locationId and date are required" },
        { status: 400 }
      );
    }

    const eventDateTime = new Date(date);
    if (isNaN(eventDateTime.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    // Prevent duplicate event
    const existing = await prisma.event.findFirst({
      where: {
        date: eventDateTime,
        locationId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Event already exists for this date and location" },
        { status: 409 }
      );
    }

    // Booking open = 3 weeks before event
    const bookingOpen = new Date(eventDateTime);
    bookingOpen.setDate(bookingOpen.getDate() - 21);

    // Booking close = 2 days before event
    const bookingClose = new Date(eventDateTime);
    bookingClose.setDate(bookingClose.getDate() - 2);

    const event = await prisma.event.create({
      data: {
        date: eventDateTime,
        city,
        country,
        locationId,
        createdBy: auth.adminId,
        bookingOpen,
        bookingClose,
        status: "Open",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Event created for ${city}`,
      event,
    });

  } catch (err: any) {
    console.error("Event creation error:", err);
    return NextResponse.json(
      { message: "Failed to create event", error: err.message },
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
    const expiredDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

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
            status: true
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
