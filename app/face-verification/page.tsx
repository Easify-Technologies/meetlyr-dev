"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useSession } from "next-auth/react";
import { useProfileDetails } from "../queries/profile";

type Step = "LEFT" | "RIGHT" | "VERIFYING" | "DONE";

export default function FaceVerificationTest() {
  const webcamRef = useRef<Webcam>(null);
  const { data: session } = useSession();

  const userId = session?.user?.id ?? "";
  const userEmail = session?.user?.email ?? "";

  const { data: profile, isPending } = useProfileDetails(userEmail);
  const avatar = profile?.avatar ?? "";

  const [step, setStep] = useState<Step>("LEFT");
  const [leftImage, setLeftImage] = useState<string | null>(null);
  const [rightImage, setRightImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    if (!webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    if (step === "LEFT") {
      setLeftImage(screenshot);
      setStep("RIGHT");
      return;
    }

    if (step === "RIGHT") {
      setRightImage(screenshot);
      await verify(screenshot);
    }
  };

  const verify = async (rightShot?: string) => {
    if (!leftImage || !(rightShot || rightImage) || !userId || !avatar) return;

    setLoading(true);
    setStep("VERIFYING");

    try {
      const formData = new FormData();

      const leftBlob = await (await fetch(leftImage)).blob();
      const rightBlob = await (await fetch(rightShot || rightImage!)).blob();

      formData.append("left", leftBlob, "left.jpg");
      formData.append("right", rightBlob, "right.jpg");
      formData.append("userId", userId);

      const res = await fetch("/api/face-verification", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Verification failed:", error);
      setResult({ error: "Verification failed" });
    } finally {
      setLoading(false);
      setStep("DONE");
    }
  };

  if (isPending) {
    return <div className="p-6 text-center">Loading profile…</div>;
  }

  if (!avatar) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Please upload a profile photo before verification.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="text-xl font-bold text-center">Face Verification</h1>

      {step !== "DONE" && (
        <>
          <p className="text-center font-semibold">
            {step === "LEFT" && "Turn your head LEFT"}
            {step === "RIGHT" && "Turn your head RIGHT"}
            {step === "VERIFYING" && "Verifying your face…"}
          </p>

          {step !== "VERIFYING" && (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "user",
              }}
              className="rounded-lg"
            />
          )}

          {step !== "VERIFYING" && (
            <button
              onClick={capture}
              className="bg-yellow-400 hover:bg-yellow-500 transition p-2 rounded font-semibold"
            >
              Capture
            </button>
          )}

          {loading && (
            <div className="text-center text-sm text-gray-600">
              Processing verification…
            </div>
          )}
        </>
      )}

      {step === "DONE" && result && (
        <div className="bg-gray-100 p-3 rounded text-sm">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
