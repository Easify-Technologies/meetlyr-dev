'use client';

import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = { error: string };

const fetchEventParticipant = async (userId: string) => {
  try {
    const res = await axios.post("/api/event/participant", { userId });

    return res.data.participantEvents ?? [];
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
};

export function useEventParticipant(userId?: string) {
  return useQuery({
    queryKey: ["event-participant", userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return fetchEventParticipant(userId);
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}
