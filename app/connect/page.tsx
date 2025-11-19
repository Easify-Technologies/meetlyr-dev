'use client';

import React from 'react';
import Navbar from '@/components/ui/Navbar';

const Page = () => {
  return (
    <>
      <Navbar />

      <section className="relative w-full min-h-screen bg-gradient-to-b from-amber-50 to-white px-5 md:px-10 py-16 flex flex-col items-center overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-amber-200 rounded-full blur-3xl opacity-40"></div>

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <h2 className='text-4xl font-bold text-[#2f1107] mb-5'>Connections</h2>
          <h3 className="text-lg md:text-xl text-amber-600 font-semibold mb-2">
            🌟Once you and someone you met at an event agree to connect, they’ll pop up here.
          </h3>
        </div>
      </section>
    </>
  )
}

export default Page