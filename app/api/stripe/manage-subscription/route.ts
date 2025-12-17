import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    try {
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error cancelling subscription" }, { status: 500 });
    }
}