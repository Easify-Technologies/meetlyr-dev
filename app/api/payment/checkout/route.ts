import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { mode, plan, userId, eventId, promoCode } = await req.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: "Missing userId or eventId" },
        { status: 400 },
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
        { status: 403 },
      );
    }

    // Check existing one-time purchase
    const existingPayment = await prisma.payment.findFirst({
      where: { userId, eventId, mode: "payment", status: "paid" },
    });

    if (mode === "payment" && existingPayment) {
      return NextResponse.json(
        { error: "You already purchased this event" },
        { status: 403 },
      );
    }

    const subscriptionPrices: Record<string, string> = {
      monthly: process.env.MONTHLY_EVENT_PRICE_ID!,
      "3months": process.env.THREE_MONTHS_EVENT_PRICE_ID!,
      "6months": process.env.SIX_MONTHS_EVENT_PRICE_ID!,
    };

    let lineItems;

    if (mode === "payment") {
      // One-time ticket €10
      lineItems = [
        {
          price: process.env.SINGLE_EVENT_PRICE_ID!,
          quantity: 1,
        },
      ];
    } else {
      // Subscription mode
      if (mode === "subscription" && (!plan || !subscriptionPrices[plan])) {
        return NextResponse.json(
          { error: "Invalid subscription plan" },
          { status: 400 },
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

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];

    if (promoCode) {
      try {
        // Validate the promotion code ID directly
        const promo = await stripe.promotionCodes.retrieve(promoCode);

        if (!promo.active) {
          return NextResponse.json(
            { error: "Promo code is inactive" },
            { status: 400 },
          );
        }

        discounts = [
          {
            promotion_code: promo.id,
          },
        ];
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid promo code" },
          { status: 400 },
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode,
      line_items: lineItems,
      discounts,
      success_url: `${req.headers.get("origin")}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment/failure`,
      metadata: {
        userId,
        eventId,
        mode,
        plan: plan || "",
        promoCode: promoCode || "",
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
