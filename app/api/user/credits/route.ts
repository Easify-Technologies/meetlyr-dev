import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, credits } = await req.json();

    if (credits > 4) {
      return NextResponse.json(
        { error: "Maximum credits limit is 4" },
        { status: 400 }
      );
    } else {
      const udpateCredits = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            subscriptionCredits: {
                increment: credits
            },
            subscriptionActive: true
        }
      });

      return NextResponse.json({ message: "Credits updated successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
