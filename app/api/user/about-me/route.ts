import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session.user.email;
    
    const data = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateDetails = await prisma.user.update({
      where: {
        email,
      },
      data: {
        connectionStyles: data.connectionStyle,
        communicationStyles: data.communicationStyle,
        socialStyles: data.socialStyle,
        healthAndFitness: data.healthFitnessStyle,
        family: data.family,
        spirituality: data.spirituality,
        politicalNews: data.politicsNews,
        incorrectHumor: data.humor,
        kindOfPeople: data.peopleType
      },
    });

    return NextResponse.json(
      { message: "About Me section updated successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
