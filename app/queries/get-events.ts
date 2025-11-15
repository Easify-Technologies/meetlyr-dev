'use client';

import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../services/get-events";
import { fetchEvents } from "../services/get-events";

type Event = {
  id: string;
  date: string;
  city: string;
  country: string;
  cafeId?: string | null;
  createdAt: string;
  isClosed: boolean;
  createdBy: string;
  participants?: {
    userId: string;
    eventId: string;
  },
  payment?: {
    id: string;
    status: string;
    mode: string;
    userId: string;
  },
  bookingOpen?: string | null;
  bookingClose?: string | null;
  status?: string | null;
};

export function useGetAllEvents(city?: string, filterDays?: string) {
  return useQuery<{ success: boolean; events: Event[] }>({
    queryKey: ["filter-events", city, filterDays],
    queryFn: () => getEvents(city, filterDays),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 10000,
  });
}

// /app/queries/get-events.ts
export function useFetchEvents() {
  return useQuery({
    queryKey: ["all-events"],
    queryFn: fetchEvents,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 10000,
  });
}
