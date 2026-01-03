import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        payment: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "S.No",
      "Name",
      "Email",
      "Phone",
      "Gender",
      "Date of Birth",
      "City",
      "Country",
      "Connection Styles",
      "Communication Styles",
      "Family Score",
      "Humor Score",
      "Health & Fitness",
      "Political News",
      "Kind Of People",
      "Payment Mode",
      "Payment Status",
      "Avatar URL",
    ];

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return "";
      return `"${String(value).replace(/"/g, '""')}"`;
    };

    const rows = users.map((user, index) => [
      index + 1,
      user.name,
      user.email,
      user.phoneNumber,
      user.gender,
      user.dateOfBirth,
      user.city,
      user.country,
      user.connectionStyles,
      user.communicationStyles,
      `${user.family ?? ""}/10`,
      `${user.incorrectHumor ?? ""}/10`,
      user.healthAndFitness,
      `${user.politicalNews ?? ""}/10`,
      user.kindOfPeople?.join(", "),
      user.payment?.[0]?.mode ?? "---",
      user.payment?.[0]?.status ?? "unpaid",
      user.avatar,
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users_${new Date()
          .toISOString()
          .split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return NextResponse.json(
      { error: "Failed to export users" },
      { status: 500 }
    );
  }
}
