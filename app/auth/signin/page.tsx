"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Sign In</h1>

      {/* 🔵 GOOGLE LOGIN */}
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        style={{
          padding: "10px 20px",
          marginTop: 20,
          cursor: "pointer",
        }}
      >
        Continue with Google
      </button>

      {/* 🔐 CREDENTIAL LOGIN */}
      <button
        onClick={() => signIn("credentials", { callbackUrl: "/" })}
        style={{
          padding: "10px 20px",
          marginTop: 10,
          cursor: "pointer",
        }}
      >
        Continue with Email
      </button>
    </div>
  );
}