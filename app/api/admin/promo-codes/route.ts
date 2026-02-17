import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const codes = await prisma.promoCode.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json({ codes }, { status: 200 });
    } catch (error) {
        console.error("Error fetching promo codes:", error);
        return NextResponse.json({ error: "Failed to fetch the promo codes" }, { status: 400 });
    }
}