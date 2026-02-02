"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

type ApiError = {
  error: string;
};

export async function sendFeedback(data: {
  eventId: string;
  cafeId: string;
  userId: string;
  overallRating: number;
  foodRating: number;
  cafeRating: number;
  serviceRating: number;
  participantRating: number;
  atmosphereRating: number;
}) {
  try {
    const res = await axios.post("/api/feedback", data);
    toast.success(res.data.message);

    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    const message = axiosErr.response?.data?.error || "Something went wrong";

    toast.error(message);
  }
}

export function useSendFeedback() {
  const router = useRouter();

  return useMutation({
    mutationFn: sendFeedback,
    onSuccess: () => {
      if (typeof window !== "undefined") {
        [
          "eventId",
          "cafeId",
          "cafeName",
          "cafeAddress",
          "matchGroupUsers",
        ].forEach((key) => localStorage.removeItem(key));
      }

      router.push("/events");
    },
  });
}
