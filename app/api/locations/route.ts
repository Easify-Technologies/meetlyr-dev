import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const file = formData.get("imageUrl") as File;

    if (!city || !country || !file) {
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
      folder: "locations", // optional: folder name in Cloudinary
      transformation: [{ width: 512, height: 512, crop: "limit" }], // optional
    });

    const location = await prisma.location.create({
      data: { city, country, imageUrl: uploadResponse.secure_url },
    });

    return NextResponse.json(
      { message: "Location added successfully", location },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error adding location" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const locations = await prisma.location.findMany();
    return NextResponse.json({ locations }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching locations" },
      { status: 500 }
    );
  }
}
