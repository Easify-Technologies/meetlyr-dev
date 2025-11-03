"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useProfileDetails } from "../queries/profile";
import { useMatchedGroupEvents } from "../queries/matched-group-events";

import Navbar from "@/components/ui/Navbar";
import Loader from "@/components/ui/loader";
import { BellIcon, UtensilsCrossed, Users2 } from "lucide-react";

const Page = () => {
  const { data: session } = useSession();
  const userId = session?.user?.email ?? "";

  const { data: profile, isLoading } = useProfileDetails(userId);
  const { data: groups, isPending } = useMatchedGroupEvents();

  if (isLoading || isPending) return <Loader />;

  return (
    <>
      <Navbar />

      <section className="relative w-full min-h-screen bg-gradient-to-b from-amber-50 to-white px-5 md:px-10 py-16 flex flex-col items-center overflow-hidden">
        {/* Decorative Backgrounds */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-amber-200 rounded-full blur-3xl opacity-40"></div>

        {/* Header */}
        <div className="relative z-10 w-full max-w-6xl mx-auto mb-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">
                Hi {profile?.name?.split(" ")[0] ?? "there"} 👋
              </h2>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Meet people in{" "}
                <span className="text-amber-600 font-semibold">
                  {profile?.city}
                </span>
              </h1>
            </div>
            <button
              type="button"
              className="p-3 bg-white text-neutral-600 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer hover:bg-[#ffd100] hover:text-[#2f1107] duration-500"
            >
              <BellIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Event Group Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {groups && groups.length > 0 ? (
            groups.map((event) => (
              <div
                key={event.eventId}
                className="bg-white rounded-3xl shadow-md border border-amber-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Café Image Placeholder */}
                <div className="h-40 w-full bg-gradient-to-r from-amber-200 to-amber-100 flex items-center justify-center text-amber-700 text-lg font-semibold">
                  ☕ {event.cafe?.name ?? "Café TBD"}
                </div>

                <div className="p-5 flex flex-col justify-between h-full">
                  <div>
                    {/* Event Details */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-amber-50 p-3 rounded-full">
                        <UtensilsCrossed className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {event.city ?? "Unknown City"}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          {new Date(event.date).toLocaleDateString("en-IN", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <hr className="border-neutral-200 my-3" />

                    {/* Groups */}
                    <div className="text-neutral-700 text-sm space-y-3">
                      {event.groups.map((group, idx: number) => (
                        <div
                          key={idx}
                          className="bg-amber-50 rounded-xl p-3 hover:bg-amber-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1 text-amber-700 font-medium">
                            <Users2 className="w-4 h-4" />
                            <span>Group {idx + 1}</span>
                          </div>
                          <ul className="list-disc list-inside text-neutral-600 text-sm">
                            {group.map((user) => (
                              <li key={user.id}>
                                {user.name}{" "}
                                <span className="text-neutral-400 text-xs">
                                  ({user.email})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center font-semibold text-xl text-neutral-500 mt-10 col-span-full">
              No matched groups yet. Please check back soon!
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default Page;
