import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { mode, userId, eventId } = await req.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: "Missing userId or eventId" },
        { status: 400 }
      );
    }

    // Check existing subscription (prevent duplicate)
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

    // 🛑 Check existing one-time purchase for this event
    const existingPayment = await prisma.payment.findFirst({
      where: { userId, eventId, mode: "payment", status: "paid" },
    });

    if (mode === "payment" && existingPayment) {
      return NextResponse.json(
        { error: "You already purchased this event" },
        { status: 403 }
      );
    }

    const lineItems =
      mode === "payment"
        ? [
            {
              price_data: {
                currency: "usd",
                product_data: { name: "Single Event Ticket" },
                unit_amount: 2000, // $20
              },
              quantity: 1,
            },
          ]
        : [
            {
              price: "price_1SOaac36VJPIw1TcE0EJzxv9", // subscription price ID
              quantity: 1,
            },
          ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode,
      line_items: lineItems,
      success_url: `${req.headers.get("origin")}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment/failure`,
      metadata: {
        userId,
        eventId,
        mode,
      },
    });

    // 🧠 Save pending payment record
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
