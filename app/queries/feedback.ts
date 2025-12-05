"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

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
    toast.success(res.data.message);

    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    const message = axiosErr.response?.data?.error || "Something went wrong";

    toast.error(message); 
  }
}

export function useSendFeedback() {
    return useMutation({
        mutationFn: sendFeedback,
        onSuccess: (data) => {
            if(data.success) {
                localStorage.removeItem("eventId");
                localStorage.removeItem("cafeId");
            }
        }
    });
}
