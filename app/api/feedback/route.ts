import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      eventId,
      userId,
      cafeId,
      overallRating,
      cafeRating,
      foodRating,
      serviceRating,
      participantRating,
      atmosphereRating,
    } = body;

    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        userId,
        eventId,
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "Feedback already submitted for this event" },
        { status: 400 },
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        eventId,
        cafeId,
        cafeRating,
        overallRating,
        foodRating,
        serviceRating,
        participantRating,
        atmosphereRating,
      },
    });

    return NextResponse.json(
      { feedback, message: "Feedback submitted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 },
    );
  }
}
