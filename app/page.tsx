'use client';

import Image from "next/image";
import Link from "next/link";
import Loader from "@/components/ui/loader";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto h-full">
            <div className="h-full flex flex-col p-4">
              <div className="">
                <div className="grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center min-h-0 lg:min-h-20 p-4 w-full">
                  <div className="flex items-center gap-2 w-20">
                    <Image
                      src="/Mocha-e1760632297719.webp"
                      alt="Meetly"
                      width={200}
                      height={200}
                      quality={100}
                      priority
                    />
                  </div>
                  <div className="hidden lg:flex items-center gap-6"></div>
                  <div className="flex items-center justify-end"></div>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto flex flex-col gap-8 justify-center items-center text-center px-4">
                    <div className="flex flex-col gap-2">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold">Take the Meetlyr personality test</h1>
                    </div>
                    <p className="text-base md:text-lg text-muted-foreground font-medium">Answer a few questions so we can seat you with like-minded individuals.</p>
                    <div className="hidden md:flex flex-col gap-4 mx-auto w-full items-center justify-center">
                      <Link href="/get-started" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all select-none disabled:pointer-events-none bg-[#FFD100] hover:bg-[#2F1107] hover:text-[#FFD100] text-[#2F1107] duration-500 h-12 px-4 py-2 rounded-full w-full border border-[#4B3F31]">Get Started</Link>
                      <Link href="/login" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all select-none disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive underline-offset-4 hover:underline rounded-full mx-auto w-fit h-fit p-0">Sign in</Link>
                    </div>
                  </div>
                  <div className="p-4 py-0 bg-background flex flex-col gap-4">
                    <div className="flex flex-col gap-4 md:hidden mb-2">
                      <Link href="/get-started" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all select-none disabled:pointer-events-none bg-[#FFD100] hover:bg-[#2F1107] hover:text-[#FFD100] text-[#2F1107] duration-500 h-12 px-4 py-2 rounded-full w-full border border-[#4B3F31]">Get Started</Link>
                      <Link href="/login" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all select-none disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive underline-offset-4 hover:underline rounded-full mx-auto w-fit h-fit p-0">Sign in</Link>
                    </div>
                    <p className="text-xs text-muted-foreground text-center font-medium">By signing up you agree to the <Link href="https://meetlyr.com/terms-and-conditions/" className="text-foreground">Terms of Service</Link>, <Link href="https://meetlyr.com/terms-and-conditions/" className="text-foreground">Privacy Policy</Link>, and <Link href="https://meetlyr.com/community-guidelines/" className="text-foreground">Community Guidelines</Link>. </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-muted">
            <div className="absolute right-1/8 h-2/3 w-auto">
              <Image
                src="/colleagues-having-a-coffee-break-1024x752.webp"
                alt="Meetly"
                width={600}
                height={600}
                quality={100}
                priority
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
