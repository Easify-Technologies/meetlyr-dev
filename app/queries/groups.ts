"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const fetchMatchedGroup = async (eventId: string) => {
  try {
    const res = await axios.get("/api/groups", {
      params: { eventId },
    });

    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export function useMatchedGroupUsers(eventId?: string) {
  return useQuery({
    queryKey: ["matched-group", eventId],
    queryFn: () => fetchMatchedGroup(eventId!),
    enabled: !!eventId, // Only run if eventId exists
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}
