"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/loader";
import { useGetEventByInviteToken } from "@/app/queries/invite-token";
import { useJoinEvent } from "@/app/queries/useJoinEvents";
import { useProfileDetails } from "@/app/queries/profile";

export default function InvitePage() {
  const { token } = useParams();
  const { data: session } = useSession();

  const router = useRouter();
  const userId = session?.user?.email ?? "";

  const { data, isLoading, isError, error } = useGetEventByInviteToken(token as string);
  const { data: profile } = useProfileDetails(userId);

  const { mutate: joinEvent, isPending } = useJoinEvent();

  const event = data?.event;
  const inviterName = data?.inviterName;

  const handleAcceptInvite = () => {
    if (!session) {
      toast.error("You need to be logged in to accept the invite.");
      router.push("/login");
      return;
    }

    if (!profile?.subscriptionActive) {
      toast.error("Your subscription has expired");
      return;
    }

    if (profile.subscriptionCredits < 1) {
      toast.error("You do not have enough credits");
      return;
    }

    joinEvent(
      {
        eventId: event.id,
        userId: userId as string,
        token: session.user.accessToken as string
      },
      {
        onSuccess: () => {
          toast.success("Successfully joined 🎉");
          router.push("/events");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to join event");
        },
      }
    );
  };

  if (isLoading) return <Loader />;

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl text-[#2f1107] font-semibold">
          Invalid or expired invite link.
        </h2>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-xl w-full bg-white shadow-md rounded-3xl p-8">
        <h1 className="text-2xl font-bold mb-4">
          {inviterName} invited you to join this event 🎉
        </h1>

        <div className="space-y-2">
          <p className="text-lg font-semibold">
            {event?.cafe?.name}
          </p>

          <p className="text-sm text-gray-600 font-semibold">
            {new Date(event?.date).toLocaleString()}
          </p>

          <p className="text-sm text-gray-600">
            {event?.cafe?.address}
          </p>
        </div>

        {isError && (
          <p className="text-red-700 font-semibold text-base">{(error as Error).message}</p>
        )}

        <button
          onClick={handleAcceptInvite}
          disabled={isPending}
          className="mt-5 w-full cursor-pointer bg-[#FFD100] text-[#2F1107] font-semibold py-3 rounded-xl hover:bg-[#2F1107] hover:text-[#FFD100] transition-all"
        >
          {isPending ? "Joining..." : "Join Event"}
        </button>
      </div>
    </section>
  );
}