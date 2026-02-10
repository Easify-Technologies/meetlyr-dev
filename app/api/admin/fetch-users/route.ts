"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        payment: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            mode: true,
            status: true,
          },
        },
      },
    });

    if (users) {
      return NextResponse.json(users, { status: 200 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 }
    );
  }
}
