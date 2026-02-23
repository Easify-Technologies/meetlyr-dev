import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const token = crypto.randomBytes(24).toString("hex");
    const { eventId, inviterId } = await req.json();

    const existingInvite = await prisma.eventInvite.findFirst({
      where: {
        eventId,
        inviterId,
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "You already created an invite for this event" },
        { status: 400 },
      );
    }

    const invite = await prisma.eventInvite.create({
      data: {
        token,
        eventId,
        inviterId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ token: invite.token }, { status: 201 });
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 },
    );
  }
}
