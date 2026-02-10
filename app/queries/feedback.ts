"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

type ApiError = {
  error: string;
};

type ParticipantFeedback = {
  participantId: string;
  rating: number;
  present: boolean;
};

export async function sendFeedback(data: {
  eventId: string;
  cafeId: string;
  userId: string;
  overallRating: number;
  cafeRating: number;
  foodRating: number;
  serviceRating: number;
  atmosphereRating: number;
  participantFeedback: ParticipantFeedback[];
}) {
  try {
    const res = await axios.post("/api/feedback", data);
    toast.success(res.data.message);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    toast.error(axiosErr.response?.data?.error || "Something went wrong");
    throw error;
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
