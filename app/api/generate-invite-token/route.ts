import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { eventId, inviterId } = await req.json();

    if (!eventId || !inviterId) {
      return NextResponse.json(
        { error: "eventId and inviterId are required" },
        { status: 400 },
      );
    }

    const existingInvite = await prisma.eventInvite.findFirst({
      where: { eventId, inviterId },
    });

    if (existingInvite) {
      return NextResponse.json(
        { token: existingInvite.token },
        { status: 200 },
      );
    }

    const token = crypto.randomBytes(24).toString("hex");

    const invite = await prisma.eventInvite.create({
      data: {
        token,
        eventId,
        inviterId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await prisma.eventParticipant.upsert({
      where: {
        eventId_userId: { eventId, userId: inviterId },
      },
      update: {
        invitationToken: token,
      },
      create: {
        eventId,
        userId: inviterId,
        invitationToken: token,
      },
    });

    return NextResponse.json({ token: invite.token }, { status: 201 });
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
