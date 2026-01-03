"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useProfileDetails } from "../queries/profile";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loader from "@/components/ui/loader";
import axios from "axios";

const PaymentClient = () => {
  const params = useSearchParams();
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = params.get("userId");
  const eventId = params.get("eventId");

  const { data: profile, isPending } = useProfileDetails(email);

  const hasPaidForThisEvent = profile?.payment?.some(
    (p: any) =>
      p.status === "paid" &&
      p.eventId === eventId
  );

  const router = useRouter();

  useEffect(() => {
    if (hasPaidForThisEvent) {
      router.push("/events");
    }
  }, [hasPaidForThisEvent, router]);

  const hasAttendedAnyEvent =
    (profile?.events?.length ?? 0) > 0 ||
    (profile?.eventParticipants?.length ?? 0) > 0;

  const hasUsedFreePass = profile?.freePass === false;

  const isFreePassEligible = !hasAttendedAnyEvent && !hasUsedFreePass;

  useEffect(() => {
    if (!isFreePassEligible && payment === "free") {
      setPayment("");
    }
  }, [isFreePassEligible, payment]);

  async function handleCheckOut() {
    if (!payment) {
      alert("Please select a payment option");
      return;
    }

    if (payment === "free") {
      try {
        const res = await axios.post("/api/event/free-pass", {
          userId,
          eventId
        });

        if (res.data.message === "Free pass applied successfully") {
          setTimeout(() => {
            router.push("/events");
          }, 1500);
        }
        return res.data;
      } catch (error) {
        console.error("Error processing free pass:", error);
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: payment === "oneTime" ? "payment" : "subscription",
          plan: payment === "oneTime" ? null : payment,
          userId,
          eventId,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error creating checkout session");
        console.error(data.error);
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setLoading(false);
    }
  }

  if (isPending) return <Loader />

  if (hasPaidForThisEvent) return <Loader />

  return (
    <>
      <Navbar />

      <section className="overflow-y-auto flex flex-col flex-1 pt-10 md:px-0 px-4 pb-24 w-full h-full md:flex-initial bg-[#FFFFF5]">
        <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
          <div className="flex flex-col w-full gap-4 md:gap-6 items-stretch justify-start flex-nowrap flex-1 min-h-0">
            <div className="flex flex-row gap-3 items-center justify-between flex-nowrap">
              <div className="flex flex-col w-full gap-1 items-stretch justify-start flex-nowrap">
                <div className="flex flex-row gap-1 items-center justify-start flex-nowrap">
                  <h1 className="text-2xl md:text-3xl font-bold font-serif">
                    Book your next Event
                  </h1>
                </div>
                <p className="text-base text-muted-foreground">
                  Friends are waiting for you
                </p>
              </div>
            </div>
            <RadioGroup
              className="grid gap-6 outline-none"
              value={payment}
              onValueChange={(value) => setPayment(value)}
            >
              {/* Free Pass Option */}
              {isFreePassEligible && (
                <div
                  className={`relative flex w-full items-start gap-3 border p-4 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${payment === "free"
                    ? "bg-green-700 border-green-700 text-white scale-[1.02]"
                    : "bg-white border-green-600 hover:bg-green-50 text-green-700"
                    }`}
                  onClick={() => setPayment("free")}
                >
                  <span className="absolute -top-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    FREE · First Event
                  </span>

                  <RadioGroupItem
                    value="free"
                    id="free"
                    className="mt-1 data-[state=checked]:bg-white data-[state=checked]:border-white"
                  />

                  <Label htmlFor="free" className="flex flex-col gap-1 cursor-pointer w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-lg md:text-xl font-semibold">
                        Free Pass
                      </span>
                      <span className="text-base md:text-lg font-bold">
                        €0.00
                      </span>
                    </div>

                    <span className="text-sm opacity-90">
                      Your first event is on us. One-time only.
                    </span>
                  </Label>
                </div>
              )}

              {/* One-time Payment Option */}
              {profile?.freePass === false && (
                <div
                  className={`relative flex w-full items-start gap-3 border p-4 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${payment === "oneTime"
                    ? "bg-[#2F1107] border-[#2F1107] text-white scale-[1.02]"
                    : "bg-white border-gray-300 hover:bg-[#2F1107]/10 text-[#2F1107]"
                    }`}
                  onClick={() => setPayment("oneTime")}
                >
                  <RadioGroupItem
                    value="oneTime"
                    id="one-time"
                    className="mt-1 text-[#2F1107] data-[state=checked]:bg-white data-[state=checked]:border-white"
                  />
                  <Label
                    htmlFor="one-time"
                    className="flex flex-col gap-1 cursor-pointer w-full"
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-lg md:text-xl font-semibold ${payment === "oneTime" ? "text-white" : "text-[#2F1107]"
                          }`}
                      >
                        One Time
                      </span>
                      <span
                        className={`text-base md:text-lg font-bold ${payment === "oneTime"
                          ? "text-[#FFD100]"
                          : "text-[#2F1107]"
                          }`}
                      >
                        €10.00
                      </span>
                    </div>
                    <span
                      className={`text-sm ${payment === "oneTime"
                        ? "text-white/80"
                        : "text-[#2F1107]/70"
                        }`}
                    >
                      Single ticket for casual one-offs and see who you'll click with!
                    </span>
                  </Label>
                </div>
              )}

              {/* --- Monthly Subscription --- */}
              <div
                className={`relative flex w-full items-start gap-3 border p-4 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${payment === "monthly"
                  ? "bg-[#2F1107] border-[#2F1107] text-white scale-[1.02]"
                  : "bg-white border-gray-300 hover:bg-[#2F1107]/10 text-[#2F1107]"
                  }`}
                onClick={() => {
                  setPayment("monthly");
                }}
              >
                {/* Discount Badge */}
                <span className="absolute -top-3 right-3 bg-[#FFD100] text-[#2F1107] text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <span className="line-through opacity-70">€20</span>
                  <span className="font-bold">€15</span>
                </span>

                <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
                <Label htmlFor="monthly" className="flex flex-col gap-1 w-full cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg md:text-xl font-semibold ${payment === "monthly" ? "text-white" : "text-[#2F1107]"
                        }`}
                    >
                      Monthly Subscription
                    </span>
                    <span
                      className={`text-base md:text-lg font-bold ${payment === "monthly" ? "text-[#FFD100]" : "text-[#2F1107]"
                        }`}
                    >
                      €15.00 / month
                    </span>
                  </div>
                  <span
                    className={`text-sm ${payment === "monthly" ? "text-white/80" : "text-[#2F1107]/70"
                      }`}
                  >
                    Pay monthly and cancel anytime.
                  </span>
                </Label>
              </div>

              {/* --- 3 Months Subscription --- */}
              <div
                className={`relative flex w-full items-start gap-3 border p-4 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${payment === "3months"
                  ? "bg-[#2F1107] border-[#2F1107] text-white scale-[1.02]"
                  : "bg-white border-gray-300 hover:bg-[#2F1107]/10 text-[#2F1107]"
                  }`}
                onClick={() => {
                  setPayment("3months");
                }}
              >
                {/* Discount Badge */}
                <span className="absolute -top-3 right-3 bg-[#FFD100] text-[#2F1107] text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <span className="line-through opacity-70">€60</span>
                  <span className="font-bold">€35</span>
                </span>

                <RadioGroupItem value="3months" id="3months" className="mt-1" />
                <Label htmlFor="3months" className="flex flex-col gap-1 w-full cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg md:text-xl font-semibold ${payment === "3months" ? "text-white" : "text-[#2F1107]"
                        }`}
                    >
                      3-Month Subscription
                    </span>
                    <span
                      className={`text-base md:text-lg font-bold ${payment === "3months" ? "text-[#FFD100]" : "text-[#2F1107]"
                        }`}
                    >
                      €35.00 / 3 months
                    </span>
                  </div>
                  <span
                    className={`text-sm ${payment === "3months" ? "text-white/80" : "text-[#2F1107]/70"
                      }`}
                  >
                    Save more with a 3-month plan.
                  </span>
                </Label>
              </div>

              {/* --- 6 Months Subscription --- */}
              <div
                className={`relative flex w-full items-start gap-3 border p-4 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${payment === "6months"
                  ? "bg-[#2F1107] border-[#2F1107] text-white scale-[1.02]"
                  : "bg-white border-gray-300 hover:bg-[#2F1107]/10 text-[#2F1107]"
                  }`}
                onClick={() => {
                  setPayment("6months");
                }}
              >
                {/* Discount Badge */}
                <span className="absolute -top-3 right-3 bg-[#FFD100] text-[#2F1107] text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <span className="line-through opacity-70">€120</span>
                  <span className="font-bold">€60</span>
                </span>

                <RadioGroupItem value="6months" id="6months" className="mt-1" />
                <Label htmlFor="6months" className="flex flex-col gap-1 w-full cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg md:text-xl font-semibold ${payment === "6months" ? "text-white" : "text-[#2F1107]"
                        }`}
                    >
                      6-Month Subscription
                    </span>
                    <span
                      className={`text-base md:text-lg font-bold ${payment === "6months" ? "text-[#FFD100]" : "text-[#2F1107]"
                        }`}
                    >
                      €60.00 / 6 months
                    </span>
                  </div>
                  <span
                    className={`text-sm ${payment === "6months" ? "text-white/80" : "text-[#2F1107]/70"
                      }`}
                  >
                    Best long-term value.
                  </span>
                </Label>
              </div>

            </RadioGroup>
            <div className="sticky bottom-0 bg-[#FFFFF5] py-4">
              {hasPaidForThisEvent ? (
                <button
                  type="button"
                  disabled
                  className="rounded-full w-full py-3 text-base bg-muted-foreground text-muted cursor-not-allowed"
                >
                  Paid
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={loading}
                  className={`rounded-full cursor-pointer w-full py-3 text-base font-semibold transition-colors duration-500 ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#2f1107] text-white hover:bg-[#ffd100] hover:text-[#2f1107]"
                    }`}
                >
                  {loading ? "Redirecting..." : "Proceed to Checkout"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentClient;
