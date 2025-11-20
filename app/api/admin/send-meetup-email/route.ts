// app/api/send-meetup-email/route.ts
import { NextResponse } from "next/server";
import { sendMeetupEmail } from "@/lib/mailer"; // <- adjust path if needed
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { to, groupNames, cafe, date, eventId } = await req.json();

    if (!to || !groupNames || !cafe || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await sendMeetupEmail({
      to, // string or string[]
      groupNames, // "Alice, Bob"
      cafe, // { name, address }
      date, // ISO string or date string
    });

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        isClosed: true,
        status: "Matched",
      },
    });

    return NextResponse.json({ success: true, message: "Confirmation Email Sent!" }, { status: 200 });
  } catch (error) {
    console.error("Error sending meetup email:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
