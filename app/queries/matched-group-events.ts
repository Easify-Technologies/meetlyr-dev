'use client';

import { useQuery } from "@tanstack/react-query";
import { matchedGroupEvents } from "../services/matched-group-events";

export function useMatchedGroupEvents() {
    return useQuery({
        queryKey: ["matched-group-events"],
        queryFn: matchedGroupEvents
    });
}