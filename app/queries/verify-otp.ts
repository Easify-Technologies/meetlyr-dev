"use client";

import { useMutation } from "@tanstack/react-query";
import { verifyOTP } from "../services/verify-otp";

export function useVerifyOTP() {
  return useMutation({
    mutationFn: verifyOTP
  });
}
