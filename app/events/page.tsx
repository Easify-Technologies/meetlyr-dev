"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useProfileDetails } from "../queries/profile";
import { useEventParticipant } from "../queries/participants";
import { useMatchedGroupUsers } from "../queries/groups";
import { useCancelMyEvent } from "../queries/cancel-event";
import { useGetPastEvents } from "../queries/past-events";
import { parseISO, format } from "date-fns";

import Navbar from "@/components/ui/Navbar";
import Loader from "@/components/ui/loader";
import { toast } from "sonner";
import { TbUsersGroup, TbCancel } from "react-icons/tb";
import { MdOutlineArrowOutward, MdOutlineLocationOn, MdEventNote, MdEmojiEvents } from "react-icons/md";
import { LuCalendarClock } from "react-icons/lu";
import { GiCoffeeCup } from "react-icons/gi";
import { FaMale, FaFemale } from "react-icons/fa";
import { BiMaleFemale } from "react-icons/bi";
import { BsFillEmojiTearFill } from "react-icons/bs";
import { FaRegCopy } from "react-icons/fa";
import { SiCoffeescript } from "react-icons/si";
import Link from "next/link";
import Image from "next/image";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const userEmail = session?.user?.email ?? "";

  const [showGroupSection, setShowGroupSection] = useState(false);

  const { data: profile, isLoading } = useProfileDetails(userEmail);
  const { data: participant, isPending } = useEventParticipant(profile?.id);
  const { data: pastEvents } = useGetPastEvents(profile?.id);
  const { mutate, isPending: cancelEventPending } = useCancelMyEvent();

  const upcomingParticipant = participant?.find((item: any) => {
    const eventDate = parseISO(item.event.date);
    return eventDate >= new Date();
  });

  const eventStatus = upcomingParticipant?.event?.status;
  const eventId = upcomingParticipant?.eventId;

  const { data: matches, isPending: matchesPending } =
    useMatchedGroupUsers(eventStatus === "Matched" ? eventId : undefined);

  const toFeedback = ({ eventId, cafeId, cafeName, cafeAddress }: { eventId: string, cafeId: string, cafeName: string, cafeAddress: string; }) => {
    router.push("/feedback");

    localStorage.setItem("eventId", eventId);
    localStorage.setItem("cafeId", cafeId);
    localStorage.setItem("cafeName", cafeName);
    localStorage.setItem("cafeAddress", cafeAddress);
  }

  useEffect(() => {
    if (!pastEvents?.length) return;

    const matchedUsers = pastEvents[0]?.event?.matchGroups?.[0]?.users ?? [];

    if (matchedUsers?.length) {
      localStorage.setItem(
        "matchGroupUsers",
        JSON.stringify(matchedUsers)
      );
    }
  }, [pastEvents]);

  useEffect(() => {
    if (!participant?.length) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const now = Date.now();

    const shouldShow = participant.some((item: any) => {
      const eventTime = parseISO(item.event.date).getTime();
      const expiryTime = eventTime + 4 * 60 * 60 * 1000;

      if (now < expiryTime) {
        const remainingTime = expiryTime - now;

        // Schedule auto-removal
        timeoutId = setTimeout(() => {
          setShowGroupSection(false);
        }, remainingTime);

        return true;
      }

      return false;
    });

    setShowGroupSection(shouldShow);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [participant]);

  if (isLoading || isPending) return <Loader />

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
          </div>
        </div>
        {participant?.length > 0 ? (
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-10">
            <div>
              {/* CARD 1 - Dinner */}
              {participant?.map((item: any) => {
                const joinedAt = parseISO(item.joinedAt);
                const formattedDate = format(joinedAt, "EEEE, MMMM d 'at' h:mm a");

                const currentDate = new Date();
                const eventDate = parseISO(item.event.date);
                const formattedEventDate = format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a");

                const cafe = item?.event?.cafe;

                const cancellationDeadline = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

                if (eventDate < currentDate) {
                  return null;
                }

                return (
                  <div key={item.id} className="space-y-5">
                    {/* 🥘 CARD 1 - Dinner Event */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer duration-500">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-orange-100 text-orange-600 p-2.5 rounded-full text-xl">
                            <GiCoffeeCup />
                          </span>
                          <h2 className="text-xl font-bold">Meetup</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <LuCalendarClock className="text-[#2f1107] md:mt-0 -mt-[22px]" />
                          <span className="text-gray-700 font-semibold text-base">
                            Joined us on {formattedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <MdEventNote className="text-[#2f1107] md:mt-0 -mt-[22px]" />
                          <span className="text-gray-700 font-semibold text-base">Event scheduled for {formattedEventDate}</span>
                        </div>
                        {eventStatus !== "Matched" && (
                          <h4 className="text-[#2f1107] font-semibold md:text-xl text-base mt-3">Further Details will be available 48 hours before the event</h4>
                        )}
                        {item?.user?.payment[0]?.mode === "subscription" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                className="flex items-center gap-1 mt-3 bg-red-100 text-red-500 px-4 py-2 rounded-md font-semibold hover:bg-red-500 hover:text-white transition-colors duration-300 cursor-pointer"
                              >
                                <TbCancel />
                                <span>Cancel my event</span>
                              </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-[#2f1107] text-2xl font-bold">
                                  Event Cancellation Notice
                                </AlertDialogTitle>

                                <AlertDialogDescription className="text-[#2f1107] font-medium">
                                  You cannot cancel an event within <strong>24 hours</strong> of the
                                  start time.
                                  <br />
                                  Please contact our team if you are facing an extraordinary situation.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel className='cursor-pointer'>Close</AlertDialogCancel>
                                {cancellationDeadline < eventDate && (
                                  <AlertDialogAction className='cursor-pointer' disabled={cancelEventPending} onClick={() => {
                                    mutate({
                                      userId: item?.userId,
                                      eventId: item?.event?.id,
                                      mode: item?.user?.payment[0]?.mode,
                                    });
                                  }}>{cancelEventPending ? "Cancelling..." : "Cancel"}</AlertDialogAction>
                                )}
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                    {/* ☕ CARD 2 - Café Info */}
                    {(cafe && eventStatus === "Matched") && (
                      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5 sm:p-6 hover:scale-[1.02] transition-transform cursor-pointer duration-500">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="bg-orange-100 text-orange-600 p-2.5 rounded-full text-xl">
                                <SiCoffeescript />
                              </span>
                              <h2 className="text-xl font-bold">Café</h2>
                            </div>
                            <div className="flex items-center">
                              <h3 className="text-gray-900 text-2xl font-semibold">{cafe.name}</h3>
                            </div>
                            <Drawer>
                              <DrawerTrigger className="bg-[#ffd100] text-[#2f1107] px-3 py-2 rounded-md flex items-center gap-1 font-semibold text-sm mt-2 cursor-pointer transition-colors duration-300 hover:bg-[#2f1107] hover:text-[#ffd100]">
                                <MdOutlineLocationOn size={18} className="md:mt-0 -mt-[18px]" />
                                <span>{cafe.address}</span>
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
              {eventStatus === "Matched" && showGroupSection && (
                <>
                  {matchesPending ? (
                    <div className="text-center py-6">
                      <Loader />
                    </div>
                  ) : matches?.[0]?.members?.length > 0 ? (
                    <div className="bg-white border border-gray-100 mt-5 shadow-sm rounded-3xl p-5 sm:p-6 hover:scale-[1.02] transition-transform cursor-pointer duration-500">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-orange-100 text-orange-600 p-2.5 rounded-full text-xl">
                            <TbUsersGroup />
                          </span>
                          <h2 className="text-xl font-bold">Groups</h2>
                        </div>

                        <h4 className="text-neutral-700 font-semibold text-base mb-4">
                          Participants ({matches[0].members.length})
                        </h4>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {matches[0].members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-white border border-gray-100 rounded-2xl p-3 hover:shadow-md transition-all"
                            >
                              <Image
                                src="/diversity.png"
                                alt="profile"
                                width={48}
                                height={48}
                                className="rounded-full w-12 h-12 object-cover bg-cover"
                              />

                              <div className="flex flex-col">
                                <p className="text-sm text-gray-500 font-semibold line-clamp-2">
                                  {member.oneLiner
                                    ?.split(",")
                                    .map((w) => w.trim())
                                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                    .join(", ")}
                                </p>

                                {member.gender === "male" && (
                                  <div className="flex items-center gap-2 my-1">
                                    <button type="button" className="bg-blue-600 text-white rounded-full p-1.5">
                                      <FaMale size={18} />
                                    </button>
                                    <span className="capitalize text-sm font-semibold text-[#2f1107]">{member.gender}</span>
                                  </div>
                                )}

                                {member.gender === "female" && (
                                  <div className="flex items-center gap-1 my-1">
                                    <button type="button" className="bg-pink-600 text-white rounded-full p-1.5">
                                      <FaFemale />
                                    </button>
                                    <span className="capitalize text-sm font-semibold text-[#2f1107]">{member.gender}</span>
                                  </div>
                                )}

                                {member.gender === "other" && (
                                  <div className="flex items-center gap-1 my-1">
                                    <button type="button" className="bg-yellow-600 text-white rounded-full p-1.5">
                                      <BiMaleFemale />
                                    </button>
                                    <span className="capitalize text-sm font-semibold text-[#2f1107]">{member.gender}</span>
                                  </div>
                                )}

                                <span className="text-xs text-orange-600 font-semibold mt-1">
                                  {member.city}, {member.country}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <h3 className="text-center mt-4 text-xl font-semibold text-neutral-700">
                      Unfortunately, no groups are formed!
                    </h3>
                  )}
                </>
              )}
              {/* CARD 4 - Past Events */}
              {pastEvents && pastEvents.length > 0 && (
                <div className="bg-white border border-gray-100 mt-5 shadow-sm rounded-3xl p-5 sm:p-6 hover:scale-[1.02] transition-transform cursor-pointer duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-orange-100 text-orange-600 p-2.5 rounded-full text-xl">
                      <MdEmojiEvents />
                    </span>
                    <h2 className="text-xl font-bold">Past Events</h2>
                  </div>

                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {pastEvents.map((past: any) => (
                      <AccordionItem
                        key={past.id}
                        value={past.id}
                        className="rounded-2xl border border-[#2f1107]/10 bg-white shadow-sm overflow-hidden transition-all duration-300 data-[state=open]:shadow-md"
                      >
                        <AccordionTrigger
                          className="flex items-center justify-between px-5 py-4 text-left hover:no-underline group"
                        >
                          <div className="flex flex-col">
                            <span className="text-[#2f1107] font-semibold text-base md:text-lg">
                              {new Date(past.event.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Europe/Paris",
                              })}
                            </span>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-5 pb-5 pt-2">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[#2f1107] font-semibold text-base">
                                {past.event.cafe.name}
                              </span>
                              <span className="text-sm font-semibold text-muted-foreground">
                                {past.event.cafe.address}
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                toFeedback({
                                  eventId: past.eventId,
                                  cafeId: past.event.cafe.id,
                                  cafeName: past.event.cafe.name,
                                  cafeAddress: past.event.cafe.address,
                                })
                              }
                              type="button"
                              className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD100] px-4 py-3 text-base font-semibold text-[#2F1107] cursor-pointer shadow-sm transition-all duration-300 hover:bg-[#2F1107] hover:text-[#FFD100] hover:shadow-md"
                            >
                              Send Feedback
                            </button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full max-w-md mx-auto">
            <div className="bg-white shadow-sm border border-gray-100 rounded-3xl px-8 py-10 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4 animate-bounce">
                <BsFillEmojiTearFill className="text-[#fbbf24]" />
              </div>
              <h3 className="text-[#2f1107] font-bold text-2xl mb-2">No Events Found</h3>
              <p className="text-neutral-600 text-sm font-medium">
                Looks like there aren’t any upcoming events near you yet.
              </p>
              <p className="text-neutral-600 text-sm font-medium">
                Check back soon or explore other cities 🌍
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Page;
