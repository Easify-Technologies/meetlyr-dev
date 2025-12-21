import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, status } = await req.json();

    if(!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const leadData = await prisma.lead.upsert({
      where: { email },
      update: {
        name,
        status: status ?? "draft",
      },
      create: {
        name,
        email,
        status: status ?? "draft",
      },
    });

    return NextResponse.json(leadData, { status: 200 });
  } catch (error) {
    console.error("Error saving lead draft:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
