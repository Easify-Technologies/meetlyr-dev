import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const eventId = session.metadata?.eventId;
      const mode = session.mode;

      if (!userId) {
        console.warn("⚠️ No userId found in session metadata");
        break;
      }

      const existingPayment = await prisma.payment.findUnique({
        where: {
          stripeSessionId: session.id
        }
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { stripeSessionId: session.id },
          data: { status: "paid" },
        });
      } else {
        await prisma.payment.create({
          data: {
            userId,
            eventId: eventId ?? "",
            stripeSessionId: session.id,
            mode: mode ?? "payment",
            status: "paid",
          },
        });
      }

      if (mode === "subscription") {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionActive: true,
            subscriptionCredits: 4, // Give 4 credits
          },
        });
      } else if (mode === "payment" && eventId) {
        await prisma.eventParticipant.create({
          data: { userId, eventId },
        });
      }

      console.log(
        "🎉 Payment confirmed and database updated for user:",
        userId
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionActive: false,
            subscriptionEndsAt: new Date(),
            subscriptionCredits: 0,
          },
        });
        console.log(`🧹 Subscription ended for user: ${userId}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
