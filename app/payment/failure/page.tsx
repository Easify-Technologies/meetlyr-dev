'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation";

import { IoMdCloseCircle } from "react-icons/io";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      router.push("/bookings");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <section className="w-full min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4 md:px-6 py-16 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-amber-200 rounded-full blur-3xl opacity-40"></div>

        {/* Card Container */}
        <div className="relative w-full max-w-5xl flex md:items-center items-start md:flex-row flex-col-reverse justify-between bg-white shadow-xl rounded-2xl overflow-hidden p-6 md:p-10 gap-7 md:gap-0">

          {/* Text Section */}
          <div className="md:w-[55%] w-full flex flex-col items-start justify-start">
            <div className="flex items-center gap-2">
              <IoMdCloseCircle size={30} className="text-red-600" />
              <h3 className="text-3xl md:text-4xl font-bold text-[#2f1107]">Payment Failed!</h3>
            </div>

            <p className="text-muted-foreground font-medium text-sm mt-2">
              Sorry we had an issue confirming your payment. Please try again.
            </p>
          </div>

          {/* Image Section */}
          <div className="relative md:w-[50%] w-full h-64 md:h-[300px]">
            <Image
              src="/17232858_2007.i518.007_loser_failure_success_winner_businessmen_set-12.jpg"
              alt="payment successful"
              fill
              className="object-cover w-full h-full rounded-xl"
              quality={100}
              priority
            />
          </div>
        </div>
      </section>

    </>
  )
}

export default Page