"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getFeedbacks = async () => {
  try {
    const res = await axios.get("/api/admin/feedback");
    return res.data.feedback;
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    throw error;
  }
};

export function useGetFeedbacks() {
  return useQuery({
    queryKey: ["feedbacks"],
    queryFn: getFeedbacks,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 5000,
  });
}
