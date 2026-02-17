import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { code, discount } = await req.json();

    if (!code || discount == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (discount < 0 || discount > 100) {
      return NextResponse.json(
        { error: "Discount must be between 0 and 100" },
        { status: 400 },
      );
    }

    const coupon = await stripe.coupons.create({
      name: code.toUpperCase(),
      duration: "once",
      percent_off: discount
    });

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discount,
        stripeCouponId: coupon.id
      },
    });

    return NextResponse.json(
      { message: "Promo code created successfully", promoCode, coupon },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: "Failed to create the promo code" },
      { status: 400 },
    );
  }
}
