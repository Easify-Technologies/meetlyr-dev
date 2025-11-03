'use client';

import React from 'react';
import Link from 'next/link';
import { useFetchEvents } from '@/app/queries/get-events';
import { parseISO, format } from "date-fns";
import { FaPlus } from "react-icons/fa";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from '@/components/ui/loader';

interface EventProps {
  id: string;
  date: string;
  createdAt: string;
  city: string;
  country: string;
  isClosed: boolean;
  cafe: {
    name: string;
  }
  admin: {
    email: string;
  }
}

const Page = () => {
  const { data: events, isPending } = useFetchEvents();

  if (isPending) return <Loader />

  return (
    <>
      <section className='w-screen min-h-screen bg-[#FFFFF5] relative'>
        <div className="w-full mx-auto py-8 md:px-8 px-4">
          <div className="flex flex-row gap-2 items-center flex-nowrap justify-between">
            <div className='flex items-center'>
              <Link
                href="/admin/dashboard"
                className="rounded-full hover:bg-[#2f1107] hover:text-white flex items-center justify-center p-2 transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-left"
                  aria-hidden="true"
                >
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
              </Link>
              <h3 className="text-2xl md:text-3xl font-bold">All Events</h3>
            </div>
            <Link href="/admin/add-events" className='bg-[#ffd100] text-[#2f1107] rounded-md transition-colors duration-300 p-2 text-sm font-semibold border border-[#2f1107] flex items-center gap-2 hover:bg-[#2f1107] hover:text-[#ffd100]'>
              <FaPlus />
              <span>Add Events</span>
            </Link>
          </div>
          <div className='w-full mt-10'>
            <div className="[&>div]:max-h-96">
              <Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                <TableHeader className="sticky top-0 bg-[#ffd100] backdrop-blur-xs">
                  <TableRow className="border-none">
                    <TableHead className='text-[#2f1107]'>S. No</TableHead>
                    <TableHead className='text-[#2f1107]'>Date</TableHead>
                    <TableHead className='text-[#2f1107]'>City</TableHead>
                    <TableHead className='text-[#2f1107]'>Country</TableHead>
                    <TableHead className='text-[#2f1107]'>Created At</TableHead>
                    <TableHead className='text-[#2f1107]'>Status</TableHead>
                    <TableHead className='text-[#2f1107]'>Created By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events && events.map((event: EventProps, idx: number) => {
                    const isoEventDate = event?.date;
                    const isoCreatedDate = event?.createdAt;

                    const formattedEventDate = format(parseISO(isoEventDate), "EEEE, MMM do h:mm a");
                    const formattedCreatedDate = format(parseISO(isoCreatedDate), "EEEE, MMM do h:mm a");

                    return (
                      <TableRow className="even:bg-[#2f1107] hover:bg-[#2f1107]/30 border-none even:text-white" key={event.id}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{formattedEventDate}</TableCell>
                        <TableCell>{event?.city}</TableCell>
                        <TableCell>{event?.country}</TableCell>
                        <TableCell>{formattedCreatedDate}</TableCell>
                        <TableCell>{event?.isClosed ? "True" : "False"}</TableCell>
                        <TableCell>{event?.admin?.email}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Page