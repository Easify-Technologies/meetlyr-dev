"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import { useSession } from 'next-auth/react';
import StarRatingComponent from '@/components/comp-171';

import { useSendFeedback } from '../queries/feedback';

const Page = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [eventId, setEventId] = useState("");
  const [cafeId, setCafeId] = useState("");
  const [rating, setRating] = useState({
    cafeRating: "",
    participantRating: "",
    atmosphereRating: ""
  });

  const { cafeRating, participantRating, atmosphereRating } = rating;

  const { mutate, isPending, isSuccess, data, error, isError } = useSendFeedback();

  const handleSendFeedback = () => {
    mutate({
      eventId,
      cafeId,
      userId,
      cafeRating: Number(cafeRating), 
      participantRating: Number(participantRating),
      atmosphereRating: Number(atmosphereRating)
    });
  }

  useEffect(() => {
    const storedEventId = localStorage.getItem("eventId") ?? "";
    const storedCafeId = localStorage.getItem("cafeId") ?? "";

    setEventId(storedEventId);
    setCafeId(storedCafeId);
  }, []);

  return (
    <>
      <Navbar />

      <section className="relative w-full min-h-screen bg-gradient-to-b from-amber-50 to-white px-5 md:px-10 py-16 flex flex-col items-center overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-amber-200 rounded-full blur-3xl opacity-40"></div>

        <h2 className='text-amber-600 text-4xl font-bold mb-4'>Feedback</h2>
        <div className='flex flex-col justify-center items-center'>
          <h4 className='text-2xl font-semibold mb-0.5'>How was your event?</h4>
          <span className='text-neutral-700 font-semibold'>Rate your overall experience.</span>
        </div>

        <div className='w-full mx-auto flex flex-col items-center justify-center mt-10'>
          <div className='flex flex-col gap-2 mb-4'>
            <h4 className='font-semibold text-lg'>What do you think of the cafe?</h4>
            <div className='flex items-center justify-center gap-1'>
              <StarRatingComponent
                value={cafeRating}
                onChange={(val) => setRating(prev => ({ ...prev, cafeRating: val }))}
              />
            </div>
          </div>
          <div className='flex flex-col gap-2 mb-4'>
            <h4 className='font-semibold text-lg'>What do you think of your participant?</h4>
            <div className='flex items-center justify-center gap-1'>
              <StarRatingComponent
                value={participantRating}
                onChange={(val) => setRating(prev => ({ ...prev, participantRating: val }))}
              />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <h4 className='font-semibold text-lg text-center'>How did you find the atmosphere and service?</h4>
            <div className='flex items-center justify-center gap-1'>
              <StarRatingComponent
                value={atmosphereRating}
                onChange={(val) => setRating(prev => ({ ...prev, atmosphereRating: val }))}
              />
            </div>
          </div>
        </div>

        <button disabled={isPending} onClick={handleSendFeedback} type="button" className='bg-[#ffd100] text-[#2f1107] shadow-md md:w-64 w-full text-center justify-center text-base font-semibold mt-5 items-center gap-2.5 px-2.5 py-3 cursor-pointer rounded-full hover:bg-[#2f1107] hover:text-[#ffd100] duration-500 transition-colors'>
          {isPending ? "Submitting..." : "Submit"}
        </button>
      </section>
    </>
  )
}

export default Page