import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { stripeCouponId, code, discount, couponId } = await req.json();

    if (!couponId || !stripeCouponId || !code || discount == null) {
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

    await stripe.coupons.del(stripeCouponId);

    const newStripeCoupon = await stripe.coupons.create({
      percent_off: discount,
      duration: "once",
      name: code.toUpperCase(),
    });

    const updatedPromo = await prisma.promoCode.update({
      where: { id: couponId },
      data: {
        code: code.toUpperCase(),
        discount,
        stripeCouponId: newStripeCoupon.id,
      },
    });

    return NextResponse.json({
      success: true,
      promoCode: updatedPromo,
      message: "Promo code updated successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating promo code:", error);

    return NextResponse.json(
      { error: "Failed to update the promo code" },
      { status: 500 },
    );
  }
}
