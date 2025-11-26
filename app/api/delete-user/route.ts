import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;

    await prisma.eventParticipant.deleteMany({
      where: { userId }
    });

    await prisma.payment.deleteMany({
      where: { userId }
    });

    const deleteAccount = await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json(deleteAccount, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
