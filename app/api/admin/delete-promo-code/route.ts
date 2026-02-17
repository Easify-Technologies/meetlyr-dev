import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { id, stripeCouponId } = await req.json();

    const deletePromoCode = await prisma.promoCode.delete({
        where: {
            id
        }
    });

    await stripe.coupons.del(stripeCouponId);

    return NextResponse.json({ message: "Promo code deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting the promo code:", error);
    return NextResponse.json(
      { error: "Failed to delete the promo code" },
      { status: 400 },
    );
  }
}
