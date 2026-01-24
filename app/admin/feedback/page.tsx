"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseISO, format } from "date-fns";
import { useGetFeedbacks } from '@/app/queries/admin/get-feedbacks';
import Loader from '@/components/ui/loader';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Page = () => {
  const { data: feedbacks, isPending } = useGetFeedbacks();

  const ITEMS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = feedbacks?.length ?? 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedFeedbacks = feedbacks?.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [feedbacks]);

  if (isPending) return <Loader />;

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
              <h3 className="text-2xl md:text-3xl font-bold">All Feedbacks</h3>
            </div>
          </div>
          <div className='w-full mt-10'>
            <div className="[&>div]:max-h-96">
              <Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                <TableHeader className="sticky top-0 bg-[#ffd100] backdrop-blur-xs">
                  <TableRow className="border-none">
                    <TableHead className='text-[#2f1107]'>S. No</TableHead>
                    <TableHead className='text-[#2f1107]'>User</TableHead>
                    <TableHead className='text-[#2f1107]'>Event</TableHead>
                    <TableHead className='text-[#2f1107]'>Cafe</TableHead>
                    <TableHead className='text-[#2f1107]'>Cafe Rating</TableHead>
                    <TableHead className='text-[#2f1107]'>Participant Rating</TableHead>
                    <TableHead className='text-[#2f1107]'>Atmosphere Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks && paginatedFeedbacks.map((feedback: any, index: number) => {
                    const isoEventDate = feedback?.event?.date;
                    const formattedEventDate = format(parseISO(isoEventDate), "EEEE, MMM do h:mm a");

                    return (
                      <TableRow className="even:bg-[#2f1107] hover:bg-[#2f1107]/30 border-none even:text-white" key={feedback.id}>
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{feedback?.user?.name}</TableCell>
                        <TableCell>{formattedEventDate}</TableCell>
                        <TableCell>{feedback?.cafe?.name}</TableCell>
                        <TableCell>{feedback?.cafeRating} / 10</TableCell>
                        <TableCell>{feedback?.participantRating} / 10</TableCell>
                        <TableCell>{feedback?.atmosphereRating} / 10</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Pagination */}
          <Pagination className="mt-6 mx-auto">
            <PaginationContent>

              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </>
  )
}

export default Page
