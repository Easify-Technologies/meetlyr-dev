'use client';

import Webcam from "react-webcam";
import { useRef, useState } from "react";

type Step = "LEFT" | "RIGHT" | "UPLOAD" | "DONE";

export default function FaceVerificationTest() {
  const webcamRef = useRef<Webcam>(null);

  const [step, setStep] = useState<Step>("LEFT");
  const [leftImage, setLeftImage] = useState<string | null>(null);
  const [rightImage, setRightImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const capture = () => {
    if (!webcamRef.current) return;
    const img = webcamRef.current.getScreenshot();

    if (step === "LEFT") {
      setLeftImage(img);
      setStep("RIGHT");
    } else if (step === "RIGHT") {
      setRightImage(img);
      setStep("UPLOAD");
    }
  };

  const verify = async () => {
    if (!leftImage || !rightImage || !profileImage) return;

    setLoading(true);

    const formData = new FormData();

    const leftBlob = await (await fetch(leftImage)).blob();
    const rightBlob = await (await fetch(rightImage)).blob();

    formData.append("left", leftBlob);
    formData.append("right", rightBlob);
    formData.append("profile", profileImage);

    const res = await fetch("/api/face-verification", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
    setStep("DONE");
  };

  return (
    <div className="p-6 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="text-xl font-bold">Face Verification Test</h1>

      {step !== "UPLOAD" && step !== "DONE" && (
        <>
          <p className="font-semibold">
            {step === "LEFT" && "Turn your head LEFT"}
            {step === "RIGHT" && "Turn your head RIGHT"}
          </p>

          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded"
          />

          <button
            onClick={capture}
            className="bg-yellow-400 p-2 rounded font-semibold"
          >
            Capture
          </button>
        </>
      )}

      {step === "UPLOAD" && (
        <>
          <p className="font-semibold">Upload your profile photo</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
          />
          <button
            onClick={verify}
            disabled={loading}
            className="bg-green-500 p-2 rounded font-semibold text-white"
          >
            {loading ? "Verifying..." : "Verify Face"}
          </button>
        </>
      )}

      {result && (
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
