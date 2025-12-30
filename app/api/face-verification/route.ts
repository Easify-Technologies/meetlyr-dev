import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const incomingForm = await req.formData();

    const left = incomingForm.get("left") as File;
    const right = incomingForm.get("right") as File;
    const profile = incomingForm.get("profile") as File;

    if (!left || !right || !profile) {
      return NextResponse.json(
        { error: "Missing images" },
        { status: 400 }
      );
    }

    // Prepare Luxand form-data
    const luxandForm = new FormData();
    luxandForm.append("photo1", profile);
    luxandForm.append("photo2", left);

    const luxandForm2 = new FormData();
    luxandForm2.append("photo1", profile);
    luxandForm2.append("photo2", right);

    const headers = {
      token: process.env.LUXAND_API_KEY!,
    };

    // Verify LEFT
    const leftRes = await fetch(
      "https://api.luxand.cloud/photo/verify",
      {
        method: "POST",
        headers,
        body: luxandForm,
      }
    );

    const leftData = await leftRes.json();

    // Verify RIGHT
    const rightRes = await fetch(
      "https://api.luxand.cloud/photo/verify",
      {
        method: "POST",
        headers,
        body: luxandForm2,
      }
    );

    const rightData = await rightRes.json();

    const leftScore = leftData.similarity ?? 0;
    const rightScore = rightData.similarity ?? 0;

    const verified = leftScore >= 0.85 && rightScore >= 0.85;

    return NextResponse.json({
      verified,
      leftScore,
      rightScore,
    });

  } catch (error: any) {
    console.error("Luxand error:", error);
    return NextResponse.json(
      { error: "Face verification failed" },
      { status: 500 }
    );
  }
}
