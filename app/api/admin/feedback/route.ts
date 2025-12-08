import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const feedback = await prisma.feedback.findMany({
            include: {
                user: {
                    select: {
                        name: true
                    }
                },
                event: {
                    select: {
                        date: true
                    }
                },
                cafe: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return NextResponse.json({ feedback, message: "Feedback fetched successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 400 });
    }
}