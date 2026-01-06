"use client";

import React, { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useProfileDetails } from "../queries/profile";
import Loader from "@/components/ui/loader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useGetAllEvents } from "../queries/get-events";
import { parseISO, format } from "date-fns";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useJoinEvent } from "../queries/useJoinEvents";

const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.email ?? "";

  const [booking, setBooking] = useState("");
  const { data: profile, isLoading } = useProfileDetails(userId);
  const { data } = useGetAllEvents(profile?.city);
  const events = data?.events ?? [];

  const { mutate: joinEvent, isPending } = useJoinEvent();

  const handleBooking = () => {
    if (!booking) {
      toast.error("Please select an event first");
      return;
    }

    if (profile?.subscriptionActive) {
      if (!session?.user?.accessToken) {
        toast.error("You are not authorized. Please login again.");
        return;
      }

      if (!profile?.id) {
        toast.error("Unable to find user profile. Please try again.");
        return;
      }

      joinEvent(
        {
          userId: profile.id,
          eventId: booking,
          token: session.user.accessToken,
        },
        {
          onSuccess: () => {
            toast.success("Successfully joined the event!");
            router.push("/events");
          },
          onError: () => {
            toast.error("Failed to join event");
          },
        }
      );

      return;
    }

    const now = new Date();

    const hasFutureSubscribedEvent = events?.some((event: any) => {
      const eventDate = new Date(event?.date);

      return (
        eventDate >= now &&
        Array.isArray(event?.participants) &&
        event.participants.some(
          (p) => p.userId === profile?.id && p.status === "Active"
        ) &&
        Array.isArray(event?.payment) &&
        event.payment.some(
          (pay) =>
            pay.userId === profile?.id &&
            pay.mode === "subscription" &&
            pay.status === "paid"
        )
      );
    });

    if (!hasFutureSubscribedEvent) {
      router.push(`/payment?userId=${profile?.id}&eventId=${booking}`);
      return;
    }
  };

  if (isLoading) return <Loader />

  return (
    <>
      <Navbar />
      <div className="flex-1 min-h-full flex flex-col lg:flex-row">
        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto h-full">
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="relative h-full bg-background">
                {/* MOBILE HEADER IMAGE */}
                <div
                  className="absolute inset-x-0 top-0 overflow-hidden z-0 lg:hidden"
                  style={{ height: "calc(40vh)" }}
                >
                  <div className="relative" style={{ height: "calc(30vh)" }}>
                    <Image
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                      src="/meetlyr-bookings.png"
                      width={100}
                      height={100}
                      quality={100}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 pointer-events-none"></div>
                  </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="h-full flex flex-col overflow-hidden lg:overflow-visible lg:bg-popover">
                  <div className="flex-shrink-0 md:py-8 py-16">
                    <div className="relative z-10 rounded-full">
                      <div className="flex justify-center items-center">
                        <Link
                          href="#"
                          className="flex items-center gap-2 text-sm font-medium text-[#2f1107]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-map-pin w-4 h-4 text-primary"
                            aria-hidden="true"
                          >
                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <p className="md:text-base text-xl font-semibold text-center underline decoration-dashed">
                            {profile?.city}, {profile?.country}
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto lg:p-4 relative lg:static">
                    <div className="h-full flex flex-col lg:h-auto">
                      <div className="relative flex-1 flex flex-col bg-popover rounded-t-[3rem] shadow-t-2xl z-20">
                        <div className="flex-1 flex flex-col p-4 lg:p-0 ">
                          <div className="space-y-6 h-full">
                            <form className="h-full flex flex-col">
                              <div className="space-y-6 flex-1">
                                <RadioGroup
                                  className="grid gap-3 outline-none"
                                  onValueChange={(value) => setBooking(value)}
                                  value={booking}
                                >
                                  {(() => {
                                    // ⭐ STEP 1 — Find the currently active FUTURE subscription event
                                    const activeSubscribedEvent = events.find((event) => {
                                      const eventDate = new Date(event?.date);
                                      const now = new Date();

                                      const isFutureEvent = eventDate >= now;

                                      const isActiveParticipant =
                                        Array.isArray(event?.participants) &&
                                        event.participants.some(
                                          (p) => p.userId === profile?.id && p.status === "Active"
                                        );

                                      const hasActiveSubscription =
                                        Array.isArray(event?.payment) &&
                                        event.payment.some(
                                          (pay) =>
                                            pay.userId === profile?.id &&
                                            pay.mode === "subscription" &&
                                            pay.status === "paid"
                                        );

                                      return isFutureEvent && isActiveParticipant && hasActiveSubscription;
                                    });

                                    return events.map((event) => {
                                      const isoEventDate = event?.date;
                                      const formattedEventDate = format(
                                        parseISO(isoEventDate),
                                        "EEEE, MMM do h:mm a"
                                      );

                                      // ⭐ REQUIRED — date guard PER event (scope fix)
                                      const eventDate = new Date(event?.date);
                                      const now = new Date();
                                      const isFutureEvent = eventDate >= now;

                                      // ⭐ STEP 2 — Check if THIS event is the active subscription
                                      const isActiveSubscriptionEvent =
                                        Array.isArray(event?.participants) &&
                                        event.participants.some(
                                          (p) => p.userId === profile?.id && p.status === "Active"
                                        ) &&
                                        Array.isArray(event?.payment) &&
                                        event.payment.some(
                                          (pay) =>
                                            pay.userId === profile?.id &&
                                            pay.mode === "subscription" &&
                                            pay.status === "paid"
                                        );

                                      // ⭐ STEP 3 — Block all events except the active subscribed one
                                      const isBlocked =
                                        activeSubscribedEvent &&
                                        activeSubscribedEvent.id !== event.id;

                                      // Old booking logic (unchanged)
                                      const isParticipant =
                                        Array.isArray(event?.participants) &&
                                        event.participants.some((p) => p.userId === profile?.id);

                                      const hasBlockingPayment =
                                        Array.isArray(event?.payment) &&
                                        event.payment.some(
                                          (pay) =>
                                            pay.userId === profile?.id &&
                                            (pay.status === "paid" || pay.mode === "subscription")
                                        );

                                      // ✅ FIX — only FUTURE booked events redirect
                                      const isEventBooked =
                                        isFutureEvent && isParticipant && hasBlockingPayment;

                                      return (
                                        <div
                                          key={event?.id}
                                          onClick={
                                            isBlocked
                                              ? undefined
                                              : isEventBooked
                                                ? () => router.push("/events")
                                                : undefined
                                          }
                                          className={`relative flex w-full items-center gap-2 border border-input 
                                          ${isEventBooked ? "bg-muted" : "bg-inherit"} 
                                          ${isBlocked ? "opacity-50 cursor-not-allowed" : ""}
                                          p-4 rounded-full shadow-xs outline-none hover:bg-[#2F1107]/10`}
                                        >
                                          <>
                                            <RadioGroupItem
                                              value={event?.id}
                                              id={event?.id}
                                              disabled={isBlocked}
                                              className="order-1 after:absolute after:inset-0 cursor-pointer border-[#2F1107] text-[#2F1107] data-[state=checked]:bg-[#2F1107] data-[state=checked]:border-[#2F1107] data-[state=checked]:text-[#2F1107]"
                                            />

                                            {isEventBooked ? (
                                              <div className="w-full flex md:flex-row flex-col md:items-center items-start md:gap-2.5 gap-2">
                                                <span className="md:text-base text-sm text-[#2f1107] font-semibold">
                                                  Event Already Booked!
                                                </span>
                                                <div className="bg-[#2F1107] rounded-full px-3 py-2">
                                                  <span className="md:text-lg text-sm font-medium text-white leading-none">
                                                    {formattedEventDate.split(" ").slice(0, 5).join(" ")}
                                                  </span>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="grid grow gap-2">
                                                <Label htmlFor={event?.id} className="flex items-center gap-2">
                                                  <h4 className="font-semibold md:text-xl text-lg text-[#2F1107]">
                                                    {formattedEventDate.split(" ").slice(0, 3).join(" ")}
                                                  </h4>
                                                  <div className="flex items-start text-center justify-center bg-[#2F1107] rounded-full px-3 py-2">
                                                    <span className="text-lg font-medium text-white leading-none">
                                                      {formattedEventDate.split(" ")[3]}
                                                    </span>
                                                    <span className="text-[10px] text-white ml-1 leading-none">
                                                      {formattedEventDate.split(" ")[4]}
                                                    </span>
                                                  </div>
                                                </Label>
                                              </div>
                                            )}
                                          </>
                                        </div>
                                      );
                                    });
                                  })()}
                                </RadioGroup>
                              </div>

                              {/* BUTTON */}
                              <div className="shrink-0 pt-6 pb-3">
                                {profile?.isVerified ? (
                                  <button
                                    type="button"
                                    onClick={handleBooking}
                                    disabled={isPending || !booking}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all outline-none bg-[#FFD100] text-[#2F1107] hover:bg-[#FFD100]/80 cursor-pointer h-12 px-4 py-2 rounded-full w-full"
                                  >
                                    {isPending ? "Booking..." : "Book my seat"}
                                  </button>
                                ) : (
                                  <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all outline-none bg-muted text-muted-foreground cursor-not-allowed h-12 px-4 py-2 rounded-full w-full">
                                    Book my seat
                                  </div>
                                )}
                              </div>

                              {/* Face Verification */}
                              {/* {!profile?.faceVerificationStatus && (
                                <div className="shrink-0 pb-4">
                                  <Link href="/face-verification" type="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all outline-none bg-[#2f1107] text-[#ffd100] hover:bg-[#2f1107]/80 cursor-pointer h-12 px-4 py-2 rounded-full w-full">Verify Your Face</Link>
                                </div>
                              )} */}
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div >

        {/* RIGHT SIDE IMAGE */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-muted" >
          <Image
            alt="bookings"
            src="/meetlyr-bookings.png"
            fill
            quality={100}
            priority
            className="object-cover"
          />
        </div >
      </div >
    </>
  );
};

export default Page;
