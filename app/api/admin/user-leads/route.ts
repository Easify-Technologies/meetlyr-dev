import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const leads = await prisma.lead.findMany();
        return NextResponse.json({ leads }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user leads:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}