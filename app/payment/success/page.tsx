'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { FaCheckCircle } from "react-icons/fa";

const Page = () => {
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
            <div className="flex items-center gap-3">
              <FaCheckCircle size={30} className="text-green-600" />
              <h3 className="text-3xl md:text-4xl font-bold text-[#2f1107]">Payment Successful!</h3>
            </div>
            
            <p className="text-muted-foreground font-medium text-sm mt-2">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>

            <Link
              href="/events"
              className="px-6 mt-5 py-3 rounded-full bg-[#2f1107] text-white text-sm font-semibold shadow-md transition-colors hover:bg-[#ffd100] hover:text-[#2f1107] duration-500"
            >
              Back Home
            </Link>
          </div>

          {/* Image Section */}
          <div className="relative md:w-[50%] w-full h-64 md:h-[300px]">
            <Image
              src="/19002321_6063412.jpg"
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