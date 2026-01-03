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
          <div className="h-full flex flex-col px-4 py-8 md:px-8 md:py-12">
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
                {/* EYEBROW */}
                <span className="text-sm md:text-base tracking-[0.3em] font-bold text-[#2F1107]/80 uppercase">
                  Every Weekend
                </span>

                {/* MAIN HEADLINE */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-[#2F1107] uppercase italic">
                  Strangers meet
                  <br />
                  at a local cafe.
                </h1>

                {/* SUBTEXT */}
                <p className="text-base md:text-lg text-muted-foreground font-medium max-w-xl">
                  Book your spot now and{" "}
                  <span className="font-semibold text-[#2F1107]">
                    meet 3 strangers at a nearby café
                  </span>
                  , matched by our AI algorithm.
                </p>
              </div>

              {/* CTA DESKTOP */}
              <div className="hidden md:flex flex-col gap-4 w-full max-w-sm mt-4">
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center font-medium transition-all h-12 px-4 py-2 rounded-full w-full bg-[#FFD100] text-[#2F1107] border border-[#4B3F31] hover:bg-[#2F1107] hover:text-[#FFD100] duration-500"
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
                  className="inline-flex items-center justify-center font-medium transition-all h-12 px-4 py-2 rounded-full w-full bg-[#FFD100] text-[#2F1107] border border-[#4B3F31] hover:bg-[#2F1107] hover:text-[#FFD100] duration-500"
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
