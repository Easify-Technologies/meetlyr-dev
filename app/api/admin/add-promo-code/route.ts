import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, discount, expiresAt } = await req.json();

    if (!code || discount == null || !expiresAt) {
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

    const expiryDate = new Date(expiresAt);
    const now = new Date();

    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid expiry date format" },
        { status: 400 },
      );
    }

    if (expiryDate <= now) {
      return NextResponse.json(
        { error: "Expiry date must be in the future" },
        { status: 400 },
      );
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        discount,
        expiresAt: expiryDate,
      },
    });

    return NextResponse.json(
      { message: "Promo code created successfully", promoCode },
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
