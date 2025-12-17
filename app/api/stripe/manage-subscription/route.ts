import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { subscriptionId, userId } = await req.json();

        // Cancel the subscription in Stripe
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if(!user?.stripeSubscriptionId) {
            return NextResponse.json({ error: "User does not have a Stripe Subscription ID" }, { status: 400 });
        }

        await stripe.subscriptions.cancel(subscriptionId);

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                subscriptionActive: false,
                subscriptionCredits: 0,
                stripeSubscriptionId: ""
            }
        });

        return NextResponse.json({ message: "Subscription cancelled successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error cancelling subscription" }, { status: 500 });
    }
}