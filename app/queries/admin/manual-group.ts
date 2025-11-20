'use client';

import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = {
    error: string;
}

export function useManualGroup() {
    return useMutation({
        mutationFn: async(data: {
            eventId: string;
            groupName: string;
            cafes: string;
            selectedParticipants: string[];
        }) => {
            try {
                const res = await axios.post("/api/admin/manual-group", data);
                return res.data;
            } catch (error) {
                const axiosErr = error as AxiosError<ApiError>;
                throw new Error(axiosErr.response?.data?.error || "Something went wrong");
            }
        }
    })
}

export function useFetchManualGroups(eventId?: string) {
  return useQuery({
    queryKey: ["manual-groups", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (eventId) params.append("eventId", eventId);

        const res = await axios.get(`/api/admin/manual-group?${params.toString()}`);
        return res.data;
      } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        throw new Error(axiosErr.response?.data?.error || "Something went wrong");
      }
    },
  });
}
