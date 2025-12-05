"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = {
  error: string;
};

export async function sendFeedback(data: {
  eventId: string;
  cafeId: string;
  userId: string;
  cafeRating: number;
  participantRating: number;
  atmosphereRating: number;
}) {
  try {
    const res = await axios.post("/api/feedback", data);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
}

export function useSendFeedback() {
    return useMutation({
        mutationFn: sendFeedback
    });
}
