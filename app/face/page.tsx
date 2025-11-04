"use client";

import { useEffect, useRef, useState } from "react";

export default function FaceVerificationPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Unable to access camera");
        console.error(err);
      }
    }
    initCamera();
  }, []);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg");
    setCaptured(imageData);
  };

  const verifyFace = async () => {
    const res = await fetch("/api/face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        liveImage: captured,
        storedFile: "/faces/selfie.jpg",
        storedFileUrl: "http://localhost:3000/faces/selfie.jpg", // ✅ Use correct key name and full URL
      }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <video
        ref={videoRef}
        autoPlay
        className="rounded-lg border"
        width={320}
        height={240}
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>

      <button
        onClick={captureImage}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Capture Face
      </button>

      {captured && (
        <>
          <img
            src={captured}
            alt="Captured face"
            className="w-40 rounded border"
          />
          <button
            onClick={verifyFace}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Verify Face
          </button>
        </>
      )}

      {result && (
        <div className="p-4 border rounded text-center">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <p>{result.isIdentical ? "✅ Match" : "❌ Not Match"}</p>
              <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
