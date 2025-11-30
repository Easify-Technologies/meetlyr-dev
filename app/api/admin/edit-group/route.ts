import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { groupId, members, cafe, eventId } = body;

        const updateMembers = await prisma.matchGroup.update({
            where: {
                id: groupId
            },
            data: {
                members,
                cafeId: cafe
            }
        });

        await prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                cafeId: cafe
            }
        });

        return NextResponse.json({ message: "Group Updated Successfully", updateMembers, status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 400 });
    }
}