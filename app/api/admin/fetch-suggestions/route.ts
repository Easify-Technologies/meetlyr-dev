import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const suggestions = await prisma.suggestions.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ suggestions }, { status: 200 });
    } catch (error) {
        console.error("Error fetching suggestions: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
