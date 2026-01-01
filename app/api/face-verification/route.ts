import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch avatar: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("Avatar URL is not an image");
  }

  const buffer = await res.arrayBuffer();
  return new File([buffer], filename, { type: contentType });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const left = form.get("left") as File;
    const right = form.get("right") as File;
    const userId = form.get("userId") as string;

    if (!left || !right || !userId) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch avatar from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user?.avatar) {
      return NextResponse.json(
        { error: "User avatar not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Download avatar
    const profile = await urlToFile(user.avatar, "profile.jpg");

    const headers = {
      Authorization: `Token ${process.env.LUXAND_API_KEY!}`,
    };

    // LEFT
    const leftForm = new FormData();
    leftForm.append("photo1", profile);
    leftForm.append("photo2", left);

    const leftRes = await fetch(
      "https://api.luxand.cloud/photo/verify",
      { method: "POST", headers, body: leftForm }
    );

    const leftText = await leftRes.text();
    if (!leftRes.ok) {
      console.error(leftText);
      return NextResponse.json({ error: "Left verification failed" }, { status: 502 });
    }

    const leftData = JSON.parse(leftText);

    // RIGHT
    const rightForm = new FormData();
    rightForm.append("photo1", profile);
    rightForm.append("photo2", right);

    const rightRes = await fetch(
      "https://api.luxand.cloud/photo/verify",
      { method: "POST", headers, body: rightForm }
    );

    const rightText = await rightRes.text();
    if (!rightRes.ok) {
      console.error(rightText);
      return NextResponse.json({ error: "Right verification failed" }, { status: 502 });
    }

    const rightData = JSON.parse(rightText);

    const leftScore = leftData.similarity ?? 0;
    const rightScore = rightData.similarity ?? 0;

    const verified = leftScore >= 0.85 && rightScore >= 0.85;

    if (verified) {
      await prisma.user.update({
        where: { id: userId },
        data: { faceVerificationStatus: true },
      });
    }

    return NextResponse.json({
      verified,
      leftScore,
      rightScore,
    });

  } catch (err) {
    console.error("Face verification error:", err);
    return NextResponse.json(
      { error: "Face verification failed" },
      { status: 500 }
    );
  }
}
