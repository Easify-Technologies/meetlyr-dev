import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId, day, time } = await req.json();

        
    } catch (error) {
        console.error("Error adding suggestion:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}