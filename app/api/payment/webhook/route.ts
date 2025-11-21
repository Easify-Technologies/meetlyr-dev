import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
  } 
  catch (err: any) {
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
        where: { stripeSessionId: session.id },
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { stripeSessionId: session.id },
          data: { status: "paid" },
        });
      } 
      else {
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

      // If it's a subscription
      if (mode === "subscription") {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionActive: true,
            subscriptionCredits: 4,
          },
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
          const html = `
          <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 24px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #eee;">
            <h2 style="color: #3c4048;">🥳 Subscription Activated!</h2>
            <p style="font-size: 15px; color: #555;">
              Welcome to the Meetlyr Premium experience! Your subscription has been successfully activated.
            </p>
            <ul style="color: #555; font-size: 14px; line-height: 1.6;">
              <li>✅ 4 Monthly free meetups</li>
              <li>🎟️ Early access to exclusive meetups</li>
              <li>💬 Connect with top community members</li>
            </ul>
            <p style="font-size: 15px; color: #555;">You can manage your subscription anytime from your dashboard.</p>
            <a href="${process.env.NEXTAUTH_URL}/events" style="display: inline-block; margin-top: 16px; background-color: #6b4f4f; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">Go to Dashboard</a>
            <p style="font-size: 13px; color: #999; margin-top: 24px;">Thanks for being part of the Meetlyr community ☕</p>
          </div>
          `;

          await transporter.sendMail({
            from: `"Meetlyr" <${process.env.SMTP_USER}>`,
            to: user?.email,
            subject: "🎉 Subscription Activated — Welcome to Meetlyr Premium!",
            html,
          });
        }
        // If it's a single payment for an event
      } 
      else if (mode === "payment" && eventId) {
        await prisma.eventParticipant.create({
          data: { userId, eventId },
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
          const html = `
            <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 24px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #eee;">
              <h2 style="color: #3c4048;">🎉 Payment Successful!</h2>
              <p style="font-size: 15px; color: #555;">
                Hi there! Your payment has been successfully processed. You’re all set to join the upcoming event.
              </p>
              <p style="font-size: 15px; color: #555;">We can’t wait to see you there! You can view your event details anytime in your Meetlyr dashboard.</p>
              <a href="${process.env.NEXTAUTH_URL}/events" style="display: inline-block; margin-top: 16px; background-color: #6b4f4f; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">View My Events</a>
              <p style="font-size: 13px; color: #999; margin-top: 24px;">Thanks for choosing Meetlyr ☕</p>
            </div>
          `;

          await transporter.sendMail({
            from: `"Meetlyr" <${process.env.SMTP_USER}>`,
            to: user?.email,
            subject: "✅ Payment Successful — You're In!",
            html,
          });
        }
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
