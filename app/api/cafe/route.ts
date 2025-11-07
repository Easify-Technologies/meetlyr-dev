import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const locationId = formData.get("locationId") as string;
    const file = formData.get("imageUrl") as File;

    if (!name || !address || !locationId || !file) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert buffer to base64 for Cloudinary upload
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: "cafes", // optional: folder name in Cloudinary
      transformation: [{ width: 512, height: 512, crop: "limit" }], // optional
    });

    const saveCafe = await prisma.cafe.create({
      data: {
        name,
        address,
        locationId,
        imageUrl: uploadResponse.secure_url,
      },
    });

    return NextResponse.json(
      { message: "Cafe added successfully", cafe: saveCafe },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error adding cafe" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cafes = await prisma.cafe.findMany({
      include: {
        location: {
          select: {
            city: true
          }
        }
      }
    });
    return NextResponse.json(cafes, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching cafes" },
      { status: 500 }
    );
  }
}
