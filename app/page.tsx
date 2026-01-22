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
        {/* MOBILE HERO IMAGE */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:hidden overflow-hidden">
          <Image
            src="/meetlyr-landing-page.jpeg"
            alt="People having a conversation over coffee"
            fill
            priority
            className="object-cover"
          />
        </div>
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto h-full">
          <div className="h-full flex flex-col px-4 pt-10 pb-8 md:px-8 md:py-12">
            {/* HEADER */}
            <div className="grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center p-4 w-full mb-8 md:mb-12">
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
            <div className="md:flex-1 flex flex-col justify-center items-center text-center px-4 gap-8 py-6 md:py-0">
              {/* HEADLINE */}
              <div className="flex flex-col gap-4 max-w-xl">
                {/* MAIN HEADLINE */}
                <h1 className="text-[30px] md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#2F1107] uppercase italic">
                  turn strangers into
                  <br />
                  friends over coffee
                </h1>

                {/* SUBTEXT */}
                <p className="text-base md:text-lg text-muted-foreground font-medium">
                  Tell us a bit about yourself and we’ll seat you with a group of people you’ll actually click with at your local café this weekend.
                </p>
              </div>

              {/* CTA DESKTOP */}
              <div className="hidden md:flex flex-col gap-4 w-full max-w-sm mt-4">
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center font-semibold transition-all uppercase h-12 px-4 py-2 rounded-full w-full bg-[#FFD100] text-[#2F1107] border border-[#4B3F31] hover:bg-[#2F1107] hover:text-[#FFD100] duration-500"
                >
                  Get Started
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
            <div className="px-4 pt-8 pb-10 md:pt-10 md:pb-12 flex flex-col gap-5">
              {/* CTA MOBILE */}
              <div className="flex flex-col gap-4 md:hidden">
                <Link
                  href="/get-started"
                  className="inline-flex items-center uppercase justify-center font-semibold transition-all h-12 px-4 py-2 rounded-full w-full bg-[#FFD100] text-[#2F1107] border border-[#4B3F31] hover:bg-[#2F1107] hover:text-[#FFD100] duration-500"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="text-sm underline underline-offset-4 text-center text-[#2f1107]"
                >
                  Already have an account? Sign in
                </Link>
              </div>

              <p className="text-[#2f1107] font-medium text-sm text-center">Your answers are private and only used to improve your group match.</p>

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
                  href="https://meetlyr.com/privacy-policy/"
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
          <Image
            src="/meetlyr-landing-page.jpeg"
            alt="People having a conversation over coffee"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
