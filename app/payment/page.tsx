"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useProfileDetails } from "../queries/profile";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loader from "@/components/ui/loader";

const Page = () => {
  const params = useSearchParams();
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = params.get("userId");
  const eventId = params.get("eventId");

  const { data: profile, isPending } = useProfileDetails(email);
  const hasPaid = profile?.payment?.some(
    (p: { status: string }) => p.status === "paid"
  );

  const router = useRouter();
  useEffect(() => {
    if (hasPaid) {
      router.push("/events");
    }
  }, [hasPaid, router]);

  async function handleCheckOut() {
    if (!payment) {
      alert("Please select a payment option");
      return;
    }
    setLoading(true);
    try {
      // Call your backend route
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: payment === "oneTime" ? "payment" : "subscription",
          userId,
          eventId,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
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

  if (isPending) return <Loader />;

  if (hasPaid) return <Loader />;
  return (
    <>
      <Navbar />

      <section className="overflow-y-auto flex flex-col flex-1 pt-10 md:px-0 px-4 w-full h-full md:flex-initial bg-[#FFFFF5]">
        <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
          <div className="flex flex-col w-full gap-4 md:gap-6 items-stretch justify-start flex-nowrap flex-1 min-h-0">
            <div className="flex flex-row gap-3 items-center justify-between flex-nowrap">
              <div className="flex flex-col w-full gap-1 items-stretch justify-start flex-nowrap">
                <div className="flex flex-row gap-1 items-center justify-start flex-nowrap">
                  <h1 className="text-2xl md:text-3xl font-bold font-serif">
                    Book your next Kin
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
              {/* One-Time Payment Option */}
              <div
                className={`relative flex w-full items-start gap-3 border p-4 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${
                  payment === "oneTime"
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
                      className={`text-lg md:text-xl font-semibold ${
                        payment === "oneTime" ? "text-white" : "text-[#2F1107]"
                      }`}
                    >
                      One Time
                    </span>
                    <span
                      className={`text-base md:text-lg font-bold ${
                        payment === "oneTime"
                          ? "text-[#FFD100]"
                          : "text-[#2F1107]"
                      }`}
                    >
                      $300.00
                    </span>
                  </div>
                  <span
                    className={`text-sm ${
                      payment === "oneTime"
                        ? "text-white/80"
                        : "text-[#2F1107]/70"
                    }`}
                  >
                    Pay once and enjoy lifetime access without renewal.
                  </span>
                </Label>
              </div>

              {/* Subscription Payment Option (Recommended) */}
              <div
                className={`relative flex w-full items-start gap-3 border p-4 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${
                  payment === "subscription"
                    ? "bg-[#2F1107] border-[#2F1107] text-white scale-[1.02]"
                    : "bg-white border-gray-300 hover:bg-[#2F1107]/10 text-[#2F1107]"
                }`}
                onClick={() => setPayment("subscription")}
              >
                {/* Recommended Badge */}
                <span className="absolute -top-3 right-3 bg-[#FFD100] text-[#2F1107] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  Recommended
                </span>

                <RadioGroupItem
                  value="subscription"
                  id="subscription"
                  className="mt-1 text-[#2F1107] data-[state=checked]:bg-white data-[state=checked]:border-white"
                />
                <Label
                  htmlFor="subscription"
                  className="flex flex-col gap-1 cursor-pointer w-full"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg md:text-xl font-semibold ${
                        payment === "subscription"
                          ? "text-white"
                          : "text-[#2F1107]"
                      }`}
                    >
                      Subscription
                    </span>
                    <span
                      className={`text-base md:text-lg font-bold ${
                        payment === "subscription"
                          ? "text-[#FFD100]"
                          : "text-[#2F1107]"
                      }`}
                    >
                      $30.00 / month
                    </span>
                  </div>
                  <span
                    className={`text-sm ${
                      payment === "subscription"
                        ? "text-white/80"
                        : "text-[#2F1107]/70"
                    }`}
                  >
                    Pay monthly and cancel anytime.
                  </span>
                </Label>
              </div>
            </RadioGroup>
            {hasPaid ? (
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
                className={`rounded-full w-full py-3 text-base font-semibold transition-colors duration-500 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#2f1107] text-white hover:bg-[#ffd100] hover:text-[#2f1107]"
                }`}
              >
                {loading ? "Redirecting..." : "Proceed to Checkout"}
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Page;
