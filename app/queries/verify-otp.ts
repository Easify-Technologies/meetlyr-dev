"use client";

import { useMutation } from "@tanstack/react-query";
import { verifyOTP } from "../services/verify-otp";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useVerifyOTP() {
  const router = useRouter();

  return useMutation({
    mutationFn: verifyOTP,
    onSuccess: async (data) => {
      if (data.success) {
        const email = sessionStorage.getItem("email");
        const password = sessionStorage.getItem("password");

        if (!email || !password) {
          console.error("Missing email/password in sessionStorage");
          return;
        }

        const login = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (!login?.error) {
          router.push("/bookings");

          sessionStorage.removeItem("email");
          sessionStorage.removeItem("password");

          sessionStorage.removeItem("name");
          sessionStorage.removeItem("email");
          sessionStorage.removeItem("phoneNumber");
          sessionStorage.removeItem("password");
        }
      }
    },
  });
}
