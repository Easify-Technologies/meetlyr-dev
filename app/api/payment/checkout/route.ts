import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { mode, plan, userId, eventId } = await req.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: "Missing userId or eventId" },
        { status: 400 }
      );
    }

    // Check existing subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionActive: true },
    });

    if (mode === "subscription" && user?.subscriptionActive) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 403 }
      );
    }

    // Check existing one-time purchase
    const existingPayment = await prisma.payment.findFirst({
      where: { userId, eventId, mode: "payment", status: "paid" },
    });

    if (mode === "payment" && existingPayment) {
      return NextResponse.json(
        { error: "You already purchased this event" },
        { status: 403 }
      );
    }

    const subscriptionPrices: Record<string, string> = {
      monthly: "price_1Sb3hIQsNj6wfpgAekW8zIyP",
      "3months": "price_1Sb3i4QsNj6wfpgAC0TNaOPb",
      "6months": "price_1Sb3j2QsNj6wfpgAyYqbOmbD",
    };

    let lineItems;

    if (mode === "payment") {
      // One-time ticket €10
      lineItems = [
        {
          price: "price_1SZzxgQsNj6wfpgAt47z7jY0",
          quantity: 1,
        },
      ];
    } else {
      // Subscription mode
      if (mode === "subscription" && (!plan || !subscriptionPrices[plan])) {
        return NextResponse.json(
          { error: "Invalid subscription plan" },
          { status: 400 }
        );
      }

      lineItems = [
        {
          price: subscriptionPrices[plan],
          quantity: 1,
        },
      ];
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    let stripeCustomerId = userRecord?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      mode,
      line_items: lineItems,
      success_url: `${req.headers.get("origin")}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment/failure`,
      metadata: {
        userId,
        eventId,
        mode,
        plan: plan || "",
      },
    });

    // Save pending payment
    await prisma.payment.create({
      data: {
        userId,
        eventId,
        stripeSessionId: session.id,
        mode,
        status: "pending",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
