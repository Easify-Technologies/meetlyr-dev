import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const avatarFile = formData.get("avatar") as File | null;

    if (!avatarFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const timestamp = Date.now();
    const extension = path.extname(avatarFile.name);
    const fileName = `user_${timestamp}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "user");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, filePath: `/user/${fileName}` });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error adding location" },
      { status: 500 }
    );
  }
}
