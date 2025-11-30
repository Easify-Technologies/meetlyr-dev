"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

type ApiError = { error: string };

const cancelMyEvent = async (data: {
  userId: string;
  eventId: string;
  mode: string;
}) => {
  try {
    const res = await axios.post("/api/cancel-event", data);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
};

export const useCancelMyEvent = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: cancelMyEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter-events"] });

      toast.success("Event Cancelled!");
      setTimeout(() => {
        router.push("/bookings");
      }, 1500);
    },
    onError: () => {
        toast.error("Event Cancellation Failed");
    }
  });
};
