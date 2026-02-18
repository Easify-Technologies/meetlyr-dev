import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    const deleteAccount = await prisma.user.delete({
      where: { id: userId },
    });

    await prisma.eventParticipant.deleteMany({
      where: { userId },
    });

    await prisma.payment.deleteMany({
      where: { userId },
    });

    await prisma.feedback.deleteMany({
      where: { userId },
    });

    await prisma.suggestions.deleteMany({
      where: { userId },
    });

    if(user?.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    }

    return NextResponse.json(deleteAccount, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
