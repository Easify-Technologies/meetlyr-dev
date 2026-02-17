"use client";

import React from 'react';
import Link from 'next/link';
import { parseISO, format } from "date-fns";
import Loader from '@/components/ui/loader';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useFetchPromoCodes } from '@/app/queries/admin/fetch-promo-codes';
import { FaTrashCan } from 'react-icons/fa6';
import { FaEdit } from "react-icons/fa";

const page = () => {
  const { data: promoCodes, isPending } = useFetchPromoCodes();

  if (isPending) return <Loader />

  return (
    <>
      <section className='w-screen md:w-full min-h-screen bg-[#FFFFF5] relative'>
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
              <h3 className="text-2xl md:text-3xl font-bold">All Promo Codes</h3>
            </div>
          </div>

          {promoCodes && promoCodes.length === 0 ? (
            <h3 className='text-xl font-semibold text-[#2f1107] text-center'>No Promo Codes Available</h3>
          ) : (
            <div className='w-full mt-10'>
              <div className="[&>div]:max-h-96">
                <Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                  <TableHeader className="sticky top-0 bg-[#ffd100] backdrop-blur-xs">
                    <TableRow className="border-none">
                      <TableHead className='text-[#2f1107]'>S.No</TableHead>
                      <TableHead className='text-[#2f1107]'>Coupon Code</TableHead>
                      <TableHead className='text-[#2f1107]'>Percentage Discount</TableHead>
                      <TableHead className='text-[#2f1107]'>Created At</TableHead>
                      <TableHead className='text-[#2f1107]'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes?.map((code: { id: string; code: string; discount: number; createdAt: string}, index: number) => {
                      const isoCreatedAt = code?.createdAt;
                      const formattedDate = format(parseISO(isoCreatedAt), "EEEE, MMM do h:mm a");

                      return (
                        <TableRow className="even:bg-[#2f1107] hover:bg-[#2f1107]/30 border-none even:text-white" key={code.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className='uppercase'>{code.code}</TableCell>
                          <TableCell>{code.discount}%</TableCell>
                          <TableCell>{formattedDate}</TableCell>
                          <TableCell className='flex items-center gap-2'>
                            <button type="button" className='bg-green-500 rounded-md p-2 transition-colors duration-300 cursor-pointer text-white hover:bg-green-600'>
                              <FaEdit size={16} />
                            </button>
                            <button type="button" className='bg-red-500 rounded-md p-2 transition-colors duration-300 cursor-pointer text-white hover:bg-red-600'>
                              <FaTrashCan size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table >
              </div >
            </div >
          )}
        </div >
      </section >
    </>
  )
}

export default page