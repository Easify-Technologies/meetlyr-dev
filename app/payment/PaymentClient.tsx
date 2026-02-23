"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useProfileDetails } from "../queries/profile";
import { useFetchPromoCodes } from "../queries/admin/fetch-promo-codes";

import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loader from "@/components/ui/loader";

import { FaKey, FaArrowLeft } from "react-icons/fa";
import { RiCoupon4Fill } from "react-icons/ri";
import { BsStars, BsChatDotsFill } from "react-icons/bs";
import { MdPayments } from "react-icons/md";
import { IoStopwatch } from "react-icons/io5";
import { GiRoundStar } from "react-icons/gi";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import toast from "react-hot-toast";

const PaymentClient = () => {
  const params = useSearchParams();
  const { data: session } = useSession();
  const router = useRouter();
  const email = session?.user?.email ?? "";

  const [payment, setPayment] = useState("");
  const [paymentDesc, setPaymentDesc] = useState("");
  const [showPaymentDesc, setShowPaymentDesc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);

  const userId = params.get("userId");
  const eventId = params.get("eventId");

  const { data: profile, isPending } = useProfileDetails(email);
  const { data: promoCodes } = useFetchPromoCodes();

  const hasPaidForThisEvent = profile?.payment?.some(
    (p: any) =>
      p.status === "paid" &&
      p.eventId === eventId
  );

  const applyPromoCode = () => {
    if (!selectedPromo) return;

    const selected = promoCodes?.find((code: any) => code.id === selectedPromo);
    if (selected) {
      setSelectedPromo(selected.stripeCouponId);
      setAppliedPromo(selected);

      toast.success(`Promo code ${selected.code} applied!`);
    }
  }

  const removePromoCode = () => {
    setSelectedPromo(null);
    setAppliedPromo(null);

    toast.success("Promo code removed!");
  }

  useEffect(() => {
    if (hasPaidForThisEvent) {
      router.push("/events");
    }
  }, [hasPaidForThisEvent, router]);

  useEffect(() => {
    if (appliedPromo) {
      setSelectedPromo(appliedPromo.id);
    }
  }, [appliedPromo]);

  async function handleCheckOut() {
    if (!payment) {
      alert("Please select a payment option");
      return;
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
          promoCode: appliedPromo?.stripeCouponId ?? null,
        }),
      });

      const data = await res.json();

      if (data.url) {
        router.push(data.url);
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

  const calculateDiscountPrice = (originalPrice: number, discountedPrice: number) => {
    const discountPercent = Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100
    );

    return discountPercent;
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
                <div className="flex flex-row gap-2 items-center justify-start flex-nowrap">
                  <button type="button" className="md:hidden block text-[#2f1107] cursor-pointer" onClick={() => router.back()}>
                    <FaArrowLeft size={20} />
                  </button>
                  <h1 className="text-2xl md:text-3xl font-bold font-serif">
                    Book your next Event
                  </h1>
                </div>
                <p className="text-base text-muted-foreground">
                  Friends are waiting for you
                </p>
                <Image
                  src="/diamond.png"
                  alt="diamond"
                  width={100}
                  height={100}
                  className="object-cover my-2 mx-auto text-center"
                />
              </div>
            </div>
            <RadioGroup
              className="grid gap-6 outline-none"
              value={payment}
              onValueChange={(value) => setPayment(value)}
            >
              {/* One-time Payment Option */}
              <div
                className={`relative flex w-full items-start gap-3 border p-4 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${payment === "oneTime"
                  ? "bg-[#2F1107] border-[#2F1107] text-white scale-[1.02]"
                  : "bg-white border-gray-300 hover:bg-[#2F1107]/10 text-[#2F1107]"
                  }`}
                onClick={() => {
                  setPayment("oneTime");
                  setPaymentDesc("€4.99 for one month");
                  setShowPaymentDesc(true);
                }}
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
                      Single Event
                    </span>
                    <span
                      className={`text-base md:text-lg font-bold ${payment === "oneTime"
                        ? "text-[#FFD100]"
                        : "text-[#2F1107]"
                        }`}
                    >
                      €4.99
                    </span>
                  </div>
                  <span
                    className={`text-base font-semibold ${payment === "oneTime"
                      ? "text-white/80"
                      : "text-[#2F1107]/70"
                      }`}
                  >
                    50% OFF FLASH Deal
                  </span>
                </Label>
              </div>

              {/* --- Monthly Subscription --- */}
              <div
                className={`relative flex w-full items-start gap-3 border p-4 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${payment === "monthly"
                  ? "bg-[#2F1107] border-[#2F1107] text-white scale-[1.02]"
                  : "bg-white border-gray-300 hover:bg-[#2F1107]/10 text-[#2F1107]"
                  }`}
                onClick={() => {
                  setPayment("monthly");
                  setPaymentDesc("€8.99 every month");
                  setShowPaymentDesc(true);
                }}
              >
                {/* Discount Badge */}
                {calculateDiscountPrice(8.99, 8.99) > 0 && (
                  <span className="absolute -top-3 right-3 bg-[#FFD100] text-[#2F1107] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    Save {calculateDiscountPrice(8.99, 8.99)}%
                  </span>
                )}

                <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
                <Label htmlFor="monthly" className="flex flex-col gap-1 w-full cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg md:text-xl font-semibold ${payment === "monthly" ? "text-white" : "text-[#2F1107]"
                        }`}
                    >
                      1 Month
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-base md:text-lg font-bold ${payment === "monthly" ? "text-[#FFD100]" : "text-[#2F1107]"
                          }`}
                      >
                        €2.07/week
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-base font-semibold ${payment === "monthly" ? "text-white/80" : "text-[#2F1107]/70"
                      }`}
                  >
                    €8.99
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
                  setPaymentDesc("€17.99 every 3 months");
                  setShowPaymentDesc(true);
                }}
              >
                {/* Discount Badge */}
                <span className="absolute -top-3 right-3 bg-[#FFD100] text-[#2F1107] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  Save {calculateDiscountPrice(26.97, 17.99)}%
                </span>

                <RadioGroupItem value="3months" id="3months" className="mt-1" />
                <Label htmlFor="3months" className="flex flex-col gap-1 w-full cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg md:text-xl font-semibold ${payment === "3months" ? "text-white" : "text-[#2F1107]"
                        }`}
                    >
                      3 Months
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-base md:text-lg font-bold ${payment === "3months" ? "text-[#FFD100]" : "text-[#2F1107]"
                          }`}
                      >
                        €1.38/week
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-base font-semibold ${payment === "3months" ? "text-white/80" : "text-[#2F1107]/70"
                      }`}
                  >
                    €17.99
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
                  setPaymentDesc("€23.99 every 6 months");
                  setShowPaymentDesc(true);
                }}
              >
                {/* Discount Badge */}
                <span className="absolute -top-3 right-3 bg-[#FFD100] text-[#2F1107] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  Save {calculateDiscountPrice(53.94, 23.99)}%
                </span>

                <RadioGroupItem value="6months" id="6months" className="mt-1" />
                <Label htmlFor="6months" className="flex flex-col gap-1 w-full cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg md:text-xl font-semibold ${payment === "6months" ? "text-white" : "text-[#2F1107]"
                        }`}
                    >
                      6 Months
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-base md:text-lg font-bold ${payment === "6months" ? "text-[#FFD100]" : "text-[#2F1107]"
                          }`}
                      >
                        €0.92/week
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-base font-semibold ${payment === "6months" ? "text-white/80" : "text-[#2F1107]/70"
                      }`}
                  >
                    €23.99
                  </span>
                </Label>
              </div>
            </RadioGroup>

            {/* Promo Code */}
            <div className="bg-white shadow-sm rounded-lg px-4 py-3">
              <h4 className="text-center text-xl text-[#2f1107] font-semibold">
                {appliedPromo ? `Applied Promo: ${appliedPromo.code} - ${appliedPromo.discount}% OFF` : "Have a promo code?"}
              </h4>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <RiCoupon4Fill size={24} />
                <Drawer>
                  <DrawerTrigger className="text-[#2f1107] font-semibold text-base underline cursor-pointer">
                    Enter here
                  </DrawerTrigger>

                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle className="text-2xl font-bold">
                        Select Promo Code
                      </DrawerTitle>
                    </DrawerHeader>

                    {promoCodes && promoCodes.length > 0 ? (
                      <RadioGroup
                        value={selectedPromo ?? ""}
                        onValueChange={(value) => setSelectedPromo(value)}
                        className="px-4 flex flex-col gap-4"
                      >
                        {promoCodes.map((code: any) => {
                          const isSelected = selectedPromo === code.id;

                          return (
                            <Label
                              key={code.id}
                              htmlFor={`promo-${code.id}`}
                              className={`relative w-full rounded-xl border-2 cursor-pointer transition-all duration-300 p-4 flex gap-3 items-start
                                ${isSelected
                                  ? "border-[#2f1107] bg-[#2f1107] text-white scale-[1.02]"
                                  : "border-gray-300 bg-white hover:border-[#ffd100] hover:shadow-md"
                                }`}
                            >
                              {/* Radio Button */}
                              <RadioGroupItem
                                value={code.id}
                                id={`promo-${code.id}`}
                                className="mt-1"
                              />

                              <div className="flex-1">
                                {/* Discount Badge */}
                                <div className="absolute -top-3 right-4 bg-[#ffd100] text-[#2f1107] text-xs font-bold px-3 py-1 rounded-full shadow">
                                  {code.discount}% OFF
                                </div>

                                {/* Header */}
                                <div className="flex items-center justify-between">
                                  <h3
                                    className={`text-lg font-bold tracking-wide ${isSelected ? "text-[#ffd100]" : "text-[#2f1107]"
                                      }`}
                                  >
                                    {code.code}
                                  </h3>
                                </div>
                              </div>
                            </Label>
                          );
                        })}
                      </RadioGroup>
                    ) : (
                      <h3 className="text-center text-xl font-semibold px-4">
                        No Promo Codes Available
                      </h3>
                    )}

                    <DrawerFooter>
                      <button
                        type="button"
                        onClick={appliedPromo ? removePromoCode : applyPromoCode}
                        className="bg-[#ffd100] text-[#2f1107] font-semibold py-2 px-4 rounded-md transition-colors duration-300 cursor-pointer hover:bg-[#2f1107] hover:text-[#ffd100]"
                      >
                        {appliedPromo ? "Remove" : "Apply"}
                      </button>

                      <DrawerClose className="w-full mt-2 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md transition-colors duration-300 cursor-pointer hover:bg-gray-400 hover:text-gray-900">
                        Cancel
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>

            <div className="flex md:flex-row flex-col items-center justify-center w-full mt-4 gap-4">
              <div className="bg-white shadow-sm rounded-lg px-4 py-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <GiRoundStar key={index} className="text-[#ffd100] inline-block" size={24} />
                ))}
                <p className="text-lg tracking-wide leading-7 font-medium my-2">The vibe was super chill and welcoming. It didn’t feel awkward or forced at all. Talking to new people felt easy, like hanging out with friends you just hadn’t met before.</p>
                <span className="text-[#2f1107] font-semibold text-sm">~ Meetlyr User</span>
              </div>
              <div className="bg-white shadow-sm rounded-lg px-4 py-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <GiRoundStar key={index} className="text-[#ffd100] inline-block" size={24} />
                ))}
                <p className="text-lg tracking-wide leading-7 font-medium my-2">Such a fun and fresh way to meet people in the city. The energy was really good, the conversations flowed naturally, and I left feeling happy, inspired, and low-key buzzing.</p>
                <span className="text-[#2f1107] font-semibold text-sm">~ Meetlyr User</span>
              </div>
            </div>

            <div className="bg-white shadow-sm py-3 px-4 mt-4 rounded-lg">
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <FaKey className="bg-[#ff83de] rounded-full text-white p-2 flex items-center justify-center" size={30} />
                    <h3 className="text-xl font-bold text-[#2f1107]">Unlimited access</h3>
                  </div>
                  <p className="text-lg tracking-wide leading-7 font-medium pl-[38px]">Step into curated experiences, invite-only meetups, and social moments designed to help you meet people you’ll actually vibe with — every single week.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <BsStars className="bg-[#f97709] rounded-full text-white p-2 flex items-center justify-center" size={30} />
                    <h3 className="text-xl font-bold text-[#2f1107]">Always something fresh</h3>
                  </div>
                  <p className="text-lg tracking-wide leading-7 font-medium pl-[38px]">New venues, new energy, new people. Every experience feels different, because it is.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <BsChatDotsFill className="bg-[#9788fd] rounded-full text-white p-2 flex items-center justify-center" size={30} />
                    <h3 className="text-xl font-bold text-[#2f1107]">Real connections only</h3>
                  </div>
                  <p className="text-lg tracking-wide leading-7 font-medium pl-[38px]">Meet people you genuinely click with, then stay connected after the event — no awkward follow-ups, no forced networking.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <MdPayments className="bg-[#00bb7c] rounded-full text-white p-2 flex items-center justify-center" size={30} />
                    <h3 className="text-xl font-bold text-[#2f1107]">Flexible Cancellation</h3>
                  </div>
                  <p className="text-lg tracking-wide leading-7 font-medium pl-[38px]">You may cancel your booking up to 24 hours before the event. Cancellations made within 24 hours are not permitted, and no refunds will be issued.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <IoStopwatch className="bg-[#0aabe3] rounded-full text-white p-2 flex items-center justify-center" size={30} />
                    <h3 className="text-xl font-bold text-[#2f1107]">Just the beginning</h3>
                  </div>
                  <p className="text-lg tracking-wide leading-7 font-medium pl-[38px]">Coming soon: group chats, city maps, new experience formats, and smarter ways to make your city feel like yours.</p>
                </div>
              </div>
            </div>

            <Link className="text-xl underline text-[#2f1107] font-bold text-center mb-5" href="https://meetlyr.com/terms-and-conditions/" target="_blank">
              Terms & Conditions
            </Link>

            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFF5] py-4 px-4">
              {showPaymentDesc && (
                <div className="bg-[#507dbc] w-72 mx-auto text-center rounded-lg px-4 py-3 mb-5 text-white font-semibold text-base">
                  {paymentDesc}
                </div>
              )}
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
