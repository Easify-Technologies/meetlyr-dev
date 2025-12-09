"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getPastEvents = async (data: { userId: string }) => {
  try {
    const res = await axios.post("/api/past-events", data);
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

export function useGetPastEvents(userId: string) {
  return useQuery({
    queryKey:["past-events", userId],
    queryFn: () => getPastEvents({ userId }),
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}
