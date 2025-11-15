"use client";

import React from "react";
import { useFetchEvents } from "@/app/queries/get-events";
import useManualMatch from "@/app/queries/admin/manual-match";
import Loader from "@/components/ui/loader";
import Image from "next/image";

const AdminEventCard = ({ event }: any) => {
  const { mutate, isPending, data, isError, isSuccess } = useManualMatch();

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm mb-4">
      <h3 className="font-semibold text-lg">{event.city}</h3>
      <p>{new Date(event.date).toLocaleString()}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-3">
        {event?.participants.map((p) => {
          const name = p?.user?.name || "Anonymous User";
          const profileImage = p?.user?.avatar || "/default-avatar.png";
          const oneLiner = p?.user?.oneLiner || "";

          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl px-5 py-6 shadow-md border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition duration-300 cursor-pointer"
            >
              <h4 className="text-sm font-semibold mb-2">Participant(s)</h4>
              {/* Top Section */}
              <div className="flex items-center gap-2">
                <Image
                  src={profileImage}
                  alt={name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover border-2 border-yellow-300 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#2f1107]">{name}</h3>
                  <p className="text-sm text-neutral-700 font-semibold">{oneLiner}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => mutate(event.id)}
        disabled={isPending || event.isClosed}
        className={`mt-3 px-4 py-2 rounded-full ${event.isClosed
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

  if (isLoading) return <Loader />;

  if (isError) return <p className="p-6 text-red-500">Failed to load events.</p>;

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
