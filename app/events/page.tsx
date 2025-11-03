"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useProfileDetails } from "../queries/profile";
import { useMatchedGroupEvents } from "../queries/matched-group-events";

import Navbar from "@/components/ui/Navbar";
import Loader from "@/components/ui/loader";
import { BellIcon, UtensilsCrossed } from "lucide-react";

const Page = () => {
  const { data: session } = useSession();
  const userId = session?.user?.email ?? "";

  const { data: profile, isLoading } = useProfileDetails(userId);
  const { data: groups, isPending } = useMatchedGroupEvents();

  if (isLoading || isPending) return <Loader />;

  return (
    <>
      <Navbar />

      <section className="relative w-full min-h-screen bg-gradient-to-b from-amber-50 to-white px-5 md:px-8 py-16 flex flex-col items-center overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-amber-200 rounded-full blur-3xl opacity-40"></div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Greeting Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">
                Hi {profile?.name?.split(" ")[0] ?? "there"} 👋
              </h2>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Meet people in{" "}
                <span className="text-neutral-400 font-semibold">{profile?.city}</span>
              </h1>
            </div>
            <button type="button" className="p-3 bg-white text-neutral-600 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer hover:bg-[#ffd100] hover:text-[#2f1107] duration-500">
              <BellIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Event Card */}
          <div className="bg-white rounded-3xl shadow-md border border-amber-100 p-5 md:p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-50 p-3 rounded-full">
                <UtensilsCrossed className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Dinner</h3>
                <p className="text-sm text-neutral-500">Friday, November 7</p>
              </div>
            </div>
            <hr className="border-neutral-200 my-3" />
            <div className="text-neutral-600 text-sm">
              <p>8:00 PM</p>
              <p>Budapest (Budapest)</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Page;
