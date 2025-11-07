'use client';

import React from 'react';
import { FaHouseUser } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { FaMapLocationDot } from "react-icons/fa6";
import { IoIosCafe } from "react-icons/io";

import { useFetchAllAdminData } from '@/app/queries/admin/dashboard';
import Loader from '@/components/ui/loader';

const Page = () => {
  const { users, cafes, locations, events, isLoading } = useFetchAllAdminData();

  if(isLoading) return <Loader />

  return (
    <>
      <section className='w-screen min-h-screen bg-[#FFFFF5] relative'>
        <div className="w-full mx-auto py-8 px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#2f1107] font-semibold text-left mb-4">
            Dashboard
          </h1>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            <div className='bg-white shadow rounded-xl p-3 flex items-center justify-between gap-3'>
              <div className='w-16 h-16 rounded-full bg-[#ffd100] flex items-center justify-center p-2 text-[#2f1107]'>
                <FaHouseUser size={30} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#2f1107] text-3xl font-bold">{users?.length > 9 ? `${users?.length}` : `0${users?.length}`}</span>
                <span className="text-[#202124] font-medium text-base">Users</span>
              </div>
            </div>
            <div className='bg-white shadow rounded-xl p-3 flex items-center justify-between gap-3'>
              <div className='w-16 h-16 rounded-full bg-[#ffd100] flex items-center justify-center p-2 text-[#2f1107]'>
                <MdEvent size={30} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#2f1107] text-3xl font-bold">{events?.length > 9 ? `${events?.length}` : `0${events?.length}`}</span>
                <span className="text-[#202124] font-medium text-base">Events</span>
              </div>
            </div>
            <div className='bg-white shadow rounded-xl p-3 flex items-center justify-between gap-3'>
              <div className='w-16 h-16 rounded-full bg-[#ffd100] flex items-center justify-center p-2 text-[#2f1107]'>
                <FaMapLocationDot size={30} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#2f1107] text-3xl font-bold">{locations?.length > 9 ? `${locations?.length}` : `0${locations?.length}`}</span>
                <span className="text-[#202124] font-medium text-base">Locations</span>
              </div>
            </div>
            <div className='bg-white shadow rounded-xl p-3 flex items-center justify-between gap-3'>
              <div className='w-16 h-16 rounded-full bg-[#ffd100] flex items-center justify-center p-2 text-[#2f1107]'>
                <IoIosCafe size={30} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#2f1107] text-3xl font-bold">{cafes?.length > 9 ? `${cafes?.length}` : `0${cafes?.length}`}</span>
                <span className="text-[#202124] font-medium text-base">Cafes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Page