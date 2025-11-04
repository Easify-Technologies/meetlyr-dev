import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ FIX: params is a Promise now
) {
  try {
    const { id } = await context.params; // ✅ Await params

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let payload: any;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const allowedFields = ["name", "address", "imageUrl", "locationId"];
    const dataToUpdate: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        dataToUpdate[field] = body[field];
      }
    }

    const updateCafe = await prisma.cafe.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      message: "Cafe updated successfully",
      user: updateCafe,
    });
  } catch (error: any) {
    console.error("Edit cafe error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
}
