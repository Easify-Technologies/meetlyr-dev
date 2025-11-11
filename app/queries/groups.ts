"use client";

import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

type ApiError = { error: string };

const fetchMatchedGroup = async (
  userId: string,
  mode: "group" | "single" = "group"
) => {
  try {
    const res = await axios.post("/api/match", { userId, mode });
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
};

export function useMatchedGroupUsers(userId: string) {
  return useQuery({
    queryKey: ["matched-users", userId],
    queryFn: () => fetchMatchedGroup(userId, "group"),
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}
