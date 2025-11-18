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


  if (isLoading) return <Loader />;

  const handleBooking = () => {
    console.log("✅ handleBooking triggered");
    console.log("booking:", booking);
    console.log("profile:", profile);
    console.log("session:", session);
    if (!booking) {
      toast.error("Please select an event first");
      return;
    }

    // If user does NOT have active subscription -> redirect to payment
    if (!profile?.subscriptionActive) {
      router.push(`/payment?userId=${profile?.id}&eventId=${booking}`);
      return;
    }

    // Otherwise -> directly join event via API
    if (!session?.user?.accessToken) {
      toast.error("You are not authorized. Please login again.");
      return;
    }

    // Ensure we have a profile id before calling the API
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
        onSuccess: (data) => {
          toast.success(data?.message || "Successfully joined the event!");
          router.push("/events");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to join event");
        },
      }
    );
  };

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
                      src="/photo-1629914707102-d04d7262ef96.jpeg"
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
                                  {events.map((event) => {
                                    const isoEventDate = event?.date;
                                    const formattedEventDate = format(
                                      parseISO(isoEventDate),
                                      "EEEE, MMM do h:mm a"
                                    );

                                    const isParticipant =
                                      Array.isArray(event?.participants) &&
                                      event.participants.some(
                                        (p) => p.userId === profile?.id && p.eventId === event?.id
                                      );
                                    const hasBlockingPayment =
                                      Array.isArray(event?.payment) &&
                                      event.payment.some((pay) => {
                                        const status = pay.status;
                                        const mode = pay.mode;
                                        const payUserId = pay.userId;

                                        const isPaid = status === "paid";
                                        const isSubscription = typeof mode === "string" && mode.toLowerCase() === "subscription";

                                        const belongsToUser = payUserId ? payUserId === profile?.id : true;

                                        return belongsToUser && (isPaid || isSubscription);
                                      });

                                    const isEventBooked = isParticipant && hasBlockingPayment;

                                    return (
                                      <div
                                        key={event?.id}
                                        className="relative flex w-full items-center gap-2 border border-input p-4 rounded-full shadow-xs outline-none has-[data-state=checked]:border-[#2F1107]/50 hover:bg-[#2F1107]/10"
                                      >
                                        <>
                                          <RadioGroupItem
                                            value={event?.id}
                                            id={event?.id}
                                            disabled={isEventBooked}
                                            className="order-1 after:absolute after:inset-0 cursor-pointer border-[#2F1107] text-[#2F1107] data-[state=checked]:bg-[#2F1107] data-[state=checked]:border-[#2F1107] data-[state=checked]:text-[#2F1107]"
                                          />

                                          {isEventBooked ? (
                                            <h4 className="w-full text-base text-[#2f1107] font-semibold">Event Already Booked!</h4>
                                          ) : (
                                            <div className="grid grow gap-2">
                                              <Label htmlFor={event?.id} className="flex items-center gap-2">
                                                <h4 className="font-semibold md:text-xl text-lg text-[#2F1107]">
                                                  {formattedEventDate.split(" ")[0] +
                                                    " " +
                                                    formattedEventDate.split(" ")[1] +
                                                    " " +
                                                    formattedEventDate.split(" ")[2]}
                                                </h4>

                                                <div className="flex items-start text-center justify-center bg-[#2F1107] rounded-full px-3 py-2">
                                                  <span className="text-lg font-medium text-white leading-none">
                                                    {formattedEventDate.split(" ")[3]}
                                                  </span>
                                                  <span className="text-[10px] text-white ml-1 leading-none translate-y--1">
                                                    {formattedEventDate.split(" ")[4]}
                                                  </span>
                                                </div>
                                              </Label>
                                            </div>
                                          )}
                                        </>
                                      </div>
                                    );
                                  })}
                                </RadioGroup>
                              </div>

                              {/* BUTTON */}
                              <div className="shrink-0 pt-6 pb-4">
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
            src="/photo-1629914707102-d04d7262ef96.jpeg"
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
