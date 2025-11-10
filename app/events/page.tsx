"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useProfileDetails } from "../queries/profile";
import { useEventParticipant } from "../queries/participants";
import { useMatchedGroupUsers } from "../queries/groups";
import { parseISO, format } from "date-fns";

import Navbar from "@/components/ui/Navbar";
import Loader from "@/components/ui/loader";
import { toast } from "sonner";
import { BellIcon, UtensilsCrossed } from "lucide-react";
import { TbUsersGroup } from "react-icons/tb";
import { MdOutlineArrowOutward } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";
import { SiCoffeescript } from "react-icons/si";
import Link from "next/link";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";

const Page = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const { data: profile, isLoading } = useProfileDetails(userEmail);
  const { data: participant } = useEventParticipant(profile?.id);
  const { data: groups } = useMatchedGroupUsers(profile?.id);

  if (isLoading) return <Loader />;

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

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-10">
          <div>
            {/* CARD 1 - Dinner */}
            {participant?.map((item: any) => {
              const joinedAt = parseISO(item.joinedAt);
              const formattedDate = format(joinedAt, "EEEE, MMMM d 'at' h:mm a");

              const cafe = item?.event?.cafe;

              return (
                <div key={item.id} className="space-y-5"> {/* spacing between the two boxes */}
                  {/* 🥘 CARD 1 - Dinner Event */}
                  <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer duration-500">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-orange-100 text-orange-600 p-2.5 rounded-full text-xl">
                          <UtensilsCrossed />
                        </span>
                        <h2 className="text-xl font-bold">Dinner</h2>
                      </div>

                      <p className="text-gray-700 font-semibold text-base">
                        {formattedDate}
                      </p>
                      <p className="text-gray-700 font-semibold text-base">
                        {item?.event?.city}, {item?.event?.country}
                      </p>
                      <p className="text-gray-700 font-semibold text-base">In English</p>
                    </div>
                  </div>

                  {/* ☕ CARD 2 - Café Info */}
                  {cafe && (
                    <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5 sm:p-6 hover:scale-[1.02] transition-transform cursor-pointer duration-500">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-orange-100 text-orange-600 p-2.5 rounded-full text-xl">
                              <SiCoffeescript />
                            </span>
                            <h2 className="text-xl font-bold">Café</h2>
                          </div>
                          <h3 className="text-gray-900 text-2xl font-semibold">{cafe.name}</h3>
                          <Drawer>
                            <DrawerTrigger className="underline text-neutral-800 font-semibold text-sm mt-1.5 cursor-pointer hover:text-[#2f1107] transition-colors duration-300">
                              {cafe.address}
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerHeader>
                                <DrawerTitle className="text-[#2f1107] text-3xl font-semibold mb-2">
                                  {cafe.name}
                                </DrawerTitle>
                                <DrawerDescription className="text-neutral-700 text-sm font-semibold">
                                  {cafe.address}
                                </DrawerDescription>
                              </DrawerHeader>
                              <DrawerFooter>
                                {/* Apple Maps */}
                                <Link
                                  href={`https://maps.apple.com/?q=${encodeURIComponent(cafe.address)}`}
                                  target="_blank"
                                  className="flex bg-white shadow-md w-full items-center gap-2 px-2.5 py-3 mb-2 cursor-pointer rounded-xl border border-input"
                                >
                                  <MdOutlineArrowOutward />
                                  <span className="text-base font-semibold text-[#2f1107]">
                                    Open in Apple Maps
                                  </span>
                                </Link>
                                {/* Google Maps */}
                                <Link
                                  target="_blank"
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.address)}`}
                                  className="flex bg-white shadow-md w-full items-center gap-2 px-2.5 py-3 mb-2 cursor-pointer rounded-xl border border-input"
                                >
                                  <MdOutlineArrowOutward />
                                  <span className="text-base font-semibold text-[#2f1107]">
                                    Open in Google Maps
                                  </span>
                                </Link>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(cafe.address);
                                    toast.success("The café address has been copied to your clipboard.");
                                  }}
                                  type="button"
                                  className="flex bg-white shadow-md w-full items-center gap-2 px-2.5 py-3 cursor-pointer rounded-xl border border-input"
                                >
                                  <FaRegCopy />
                                  <span className="text-base font-semibold text-[#2f1107]">
                                    Copy Address
                                  </span>
                                </button>

                                <DrawerClose className="flex bg-[#ffd100] text-[#2f1107] shadow-md w-full text-center justify-center text-base font-semibold mt-3 items-center gap-2.5 px-2.5 py-3 mb-2 cursor-pointer rounded-xl hover:bg-[#2f1107] hover:text-[#ffd100] duration-500 transition-colors">
                                  Cancel
                                </DrawerClose>
                              </DrawerFooter>
                            </DrawerContent>
                          </Drawer>
                        </div>

                        {cafe.imageUrl && (
                          <div className="flex-shrink-0 w-full sm:w-52 h-40 sm:h-36 rounded-2xl overflow-hidden shadow-md">
                            <Image
                              src={cafe.imageUrl}
                              alt={cafe.name}
                              width={200}
                              height={150}
                              className="object-cover w-full h-full rounded-2xl"
                              quality={100}
                              priority
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {/* CARD 3 - Group */}
            <div className="bg-white border border-gray-100 mt-5 shadow-sm rounded-3xl p-5 sm:p-6 hover:scale-[1.02] transition-transform cursor-pointer duration-500">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-orange-100 text-orange-600 p-2.5 rounded-full text-xl">
                    <TbUsersGroup />
                  </span>
                  <h2 className="text-xl font-bold">Groups</h2>
                </div>
                <div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Page;
