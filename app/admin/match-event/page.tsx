"use client";

import React from "react";
import { useFetchEvents } from "@/app/queries/get-events";
import useManualMatch from "@/app/queries/admin/manual-match";

const AdminEventCard = ({ event }: any) => {
  const { mutate, isPending, data, isError, isSuccess } = useManualMatch();

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm mb-4">
      <h3 className="font-semibold text-lg">{event.city}</h3>
      <p>{new Date(event.date).toLocaleString()}</p>

      <p className="text-sm text-gray-500">
        {event.participants?.length || 0} participants
      </p>

      <button
        onClick={() => mutate(event.id)}
        disabled={isPending || event.isClosed}
        className={`mt-3 px-4 py-2 rounded-full ${
          event.isClosed
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-300"
        }`}
      >
        {event.isClosed
          ? "Already Matched"
          : isPending
          ? "Matching..."
          : "Run Matching"}
      </button>

      {isSuccess && (
        <p className="text-green-600 mt-2">
          ✅ {data.message} ({data.totalGroups} groups formed)
        </p>
      )}
      {isError && <p className="text-red-500 mt-2">Matching Already Done.</p>}
    </div>
  );
};

export default function MatchEventPage() {
  const { data, isLoading, isError } = useFetchEvents();

  if (isLoading) return <p className="p-6">Loading events...</p>;
  if (isError)
    return <p className="p-6 text-red-500">Failed to load events.</p>;

  // ✅ Fix here
  const events = Array.isArray(data) ? data : data?.events || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Match Events</h1>

      {events.length === 0 && <p>No events found.</p>}

      {events.map((event: any) => (
        <AdminEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
