"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const removeEvent = async (data: { eventId: string }) => {
  try {
    const res = await axios.post("/api/event/remove", data);
    return res.data;
  } catch (error) {
    const backendError = (error as AxiosError<any>)?.response?.data?.error;
    throw new Error(backendError || "Registration failed");
  }
};

export function useRemoveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-events"] });
    },
  });
}
