// app/api/send-meetup-email/route.ts
import { NextResponse } from "next/server";
import { sendMeetupEmail } from "@/lib/mailer"; // <- adjust path if needed

export async function POST(req: Request) {
  try {
    const { to, groupNames, cafe, date } = await req.json();

    if (!to || !groupNames || !cafe || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await sendMeetupEmail({
      to,          // string or string[]
      groupNames,  // "Alice, Bob"
      cafe,        // { name, address }
      date,        // ISO string or date string
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending meetup email:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
