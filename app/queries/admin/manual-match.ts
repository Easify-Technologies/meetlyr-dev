"use client";

import { useMutation } from "@tanstack/react-query";

export default function useManualMatch() {
  return useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch("/api/event/manual-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to run manual match");
      }
      return res.json();
    },
  });
}
