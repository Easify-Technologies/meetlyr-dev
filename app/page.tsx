"use client";

import Image from "next/image";
import Link from "next/link";
import Loader from "@/components/ui/loader";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto h-full">
          <div className="h-full flex flex-col p-4">
            {/* HEADER */}
            <div className="grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center p-4 w-full">
              <div className="flex items-center gap-2 w-24">
                <Image
                  src="/Mocha-e1760632297719.webp"
                  alt="Meetlyr"
                  width={200}
                  height={200}
                  priority
                />
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="md:flex-1 flex flex-col justify-center items-center text-center px-4 gap-6">
              {/* HEADLINE */}
              <div className="flex flex-col gap-4 max-w-xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mt-6">
                  Meet people over coffee — matched by personality
                </h1>
                <p className="text-base md:text-lg text-muted-foreground font-medium">
                  Take a short personality test and get seated with like-minded
                  people at curated in-person coffee meetups.
                </p>
                <p className="text-sm md:text-base text-muted-foreground font-semibold">
                  No swiping. No awkward intros. Just real conversations.
                </p>
              </div>

              {/* HOW IT WORKS */}
              <div className="flex flex-col md:flex-row gap-6 md:mt-4 mt-0 text-left max-w-2xl">
                <div className="flex gap-3 justify-center">
                  <span className="font-semibold">1.</span>
                  <p className="text-sm md:text-base text-muted-foreground font-medium">
                    Answer a few personality questions (takes under 3 minutes)
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <span className="font-semibold">2.</span>
                  <p className="text-sm md:text-base text-muted-foreground font-medium">
                    We group you with people who think and communicate like you
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <span className="font-semibold">3.</span>
                  <p className="text-sm md:text-base text-muted-foreground font-medium">
                    Meet them at a hosted coffee meetup in your city
                  </p>
                </div>
              </div>

              {/* CTA DESKTOP */}
              <div className="hidden md:flex flex-col gap-4 w-full max-w-sm mt-4">
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center font-medium transition-all h-12 px-4 py-2 rounded-full w-full bg-[#FFD100] text-[#2F1107] border border-[#4B3F31] hover:bg-[#2F1107] hover:text-[#FFD100] duration-500"
                >
                  Take the 3-minute test
                </Link>
                <Link
                  href="/login"
                  className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>

            {/* FOOTER / MOBILE CTA */}
            <div className="px-4 pb-4 flex flex-col gap-4 md:mt-0 mt-6">
              {/* CTA MOBILE */}
              <div className="flex flex-col gap-4 md:hidden">
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center font-medium transition-all h-12 px-4 py-2 rounded-full w-full bg-[#FFD100] text-[#2F1107] border border-[#4B3F31] hover:bg-[#2F1107] hover:text-[#FFD100] duration-500"
                >
                  Take the 3-minute test
                </Link>
                <Link
                  href="/login"
                  className="text-sm underline underline-offset-4 text-center text-[#2f1107]"
                >
                  Already have an account? Sign in
                </Link>
              </div>

              {/* PRIVACY REASSURANCE */}
              <p className="text-xs md:pt-4 pt-0 font-semibold text-muted-foreground text-center">
                Your answers are private and only used to improve your group
                match.
              </p>

              {/* LEGAL */}
              <p className="text-xs text-muted-foreground text-center font-medium">
                By signing up you agree to the{" "}
                <Link
                  href="https://meetlyr.com/terms-and-conditions/"
                  className="text-foreground"
                >
                  Terms of Service
                </Link>
                ,{" "}
                <Link
                  href="https://meetlyr.com/terms-and-conditions/"
                  className="text-foreground"
                >
                  Privacy Policy
                </Link>
                , and{" "}
                <Link
                  href="https://meetlyr.com/community-guidelines/"
                  className="text-foreground"
                >
                  Community Guidelines
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-muted overflow-hidden">
          <div className="relative w-[80%]">
            <Image
              src="/colleagues-having-a-coffee-break-1024x752.webp"
              alt="People having a conversation over coffee"
              width={800}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
