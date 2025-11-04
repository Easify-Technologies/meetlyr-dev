import { NextRequest, NextResponse } from "next/server";
import createFaceClient, { isUnexpected } from "@azure-rest/ai-vision-face";
import { AzureKeyCredential } from "@azure/core-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { liveImage, storedFileUrl } = await req.json();

        if (!liveImage || !storedFileUrl) {
            return NextResponse.json({ error: "Missing image data" }, { status: 400 });
        }

        // Initialize Azure Face API client
        const endpoint = process.env.AZURE_FACE_ENDPOINT!;
        const key = process.env.AZURE_FACE_KEY!;
        const client = createFaceClient(endpoint, new AzureKeyCredential(key));

        // Convert base64 -> binary buffer
        const base64Data = liveImage.split(",")[1];
        const binary = Buffer.from(base64Data, "base64");

        // ---- Detect live image face ----
        const liveDetect = await client.path("/detect").post({
            contentType: "application/octet-stream",
            body: binary,
            queryParameters: {
                detectionModel: "detection_03",
                recognitionModel: "recognition_04",
                returnFaceId: true,
            },
        });

        if (isUnexpected(liveDetect) || !Array.isArray(liveDetect.body) || liveDetect.body.length === 0) {
            console.error("Live image detection failed:", liveDetect.body);
            return NextResponse.json({ error: "No face detected in live image" }, { status: 400 });
        }

        const liveFaceId = liveDetect.body[0].faceId;

        // ---- Detect stored image face ----
        const storedDetect = await client.path("/detect").post({
            contentType: "application/json",
            body: { url: storedFileUrl },
            queryParameters: {
                detectionModel: "detection_03",
                recognitionModel: "recognition_04",
                returnFaceId: true,
            },
        });

        if (isUnexpected(storedDetect) || !Array.isArray(storedDetect.body) || storedDetect.body.length === 0) {
            console.error("Stored image detection failed:", storedDetect.body);
            return NextResponse.json({ error: "No face detected in stored image" }, { status: 400 });
        }

        const storedFaceId = storedDetect.body[0].faceId;

        // ---- Verify faces ----
        const verifyResponse = await (
            client.path("/verify") as any
        ).post({
            contentType: "application/json",
            body: {
                faceId1: liveFaceId,
                faceId2: storedFaceId,
            },
        })

        if (isUnexpected(verifyResponse)) {
            console.error("Verification failed:", verifyResponse.body);
            return NextResponse.json({ error: "Face verification failed" }, { status: 400 });
        }

        return NextResponse.json({
            isIdentical: verifyResponse.body.isIdentical,
            confidence: verifyResponse.body.confidence,
        });
    } catch (err: any) {
        console.error("❌ Face verification error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
