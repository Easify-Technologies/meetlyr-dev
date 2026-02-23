'use client';

import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useFetchEvents } from '@/app/queries/get-events';
import { parseISO, format } from "date-fns";
import { FaPlus } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from '@/components/ui/loader';
import { useFetchAllLocations } from '@/app/queries/fetch-locations';
import { useRemoveEvent } from '@/app/queries/admin/remove-event';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

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
  invites: [{
    inviter: {
      name: string;
    }
  }]
}

interface LocationProps {
  id: string;
  city: string;
  country: string;
}

const Page = () => {
  const { data: events, isPending } = useFetchEvents();
  const { data: locations } = useFetchAllLocations();
  const { mutate, isPending: removeLoading } = useRemoveEvent();

  const [searchTerm, setSearchTerm] = useState({
    country: "",
    date: ""
  });

  const { country, date } = searchTerm;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchTerm({ ...searchTerm, [name]: value });
  }

  const deferredCountry = useDeferredValue(country);
  const deferredDate = useDeferredValue(date);

  const filteredEvents = useMemo(() => {
    return events?.filter((event: { date: string; country: string; }) => {
      const eventDate = format(parseISO(event.date), "yyyy-MM-dd");

      return (
        (deferredCountry === "" ||
          event.country.toLowerCase().includes(deferredCountry.toLowerCase())) &&
        (deferredDate === "" || eventDate === deferredDate)
      );
    });
  }, [events, deferredCountry, deferredDate]);

  const ITEMS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = filteredEvents?.length ?? 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedEvents = filteredEvents?.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredEvents]);

  if (isPending) return <Loader />

  return (
    <>
      <section className='w-screen md:w-full min-h-screen bg-[#FFFFF5] relative'>
        <div className="w-full mx-auto py-8 md:px-8 px-4">
          {/* Header */}
          <div className="flex md:flex-row flex-col md:items-center items-start md:justify-between justify-start md:gap-0 gap-3.5">
            <div className='flex items-center gap-1'>
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
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </Link>
              <h3 className="text-2xl md:text-3xl font-bold">All Events</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <select
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-12 min-w-0 rounded-full border bg-muted px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm w-full"
                name="country"
                value={country}
                onChange={handleInputChange}
              >
                <option value="">Select Country</option>
                {locations.map((loc: LocationProps) => (
                  <option key={loc.id} value={loc.country}>
                    {loc.country}
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="date"
                value={date}
                onChange={handleInputChange}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-12 min-w-0 rounded-full border bg-muted px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm w-full"
              />

              <Link
                href="/admin/add-events"
                className="bg-[#ffd100] text-[#2f1107] rounded-full transition-colors duration-300 p-2 text-base font-semibold border border-[#2f1107] flex items-center justify-center gap-2 hover:bg-[#2f1107] hover:text-[#ffd100]"
              >
                <FaPlus />
                <span>Add Events</span>
              </Link>
            </div>
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
                    <TableHead className='text-[#2f1107]'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events && paginatedEvents.map((event: EventProps, idx: number) => {
                    const isoEventDate = event?.date;
                    const isoCreatedDate = event?.createdAt;

                    const formattedEventDate = format(parseISO(isoEventDate), "EEEE, MMM do h:mm a");
                    const formattedCreatedDate = format(parseISO(isoCreatedDate), "EEEE, MMM do h:mm a");

                    return (
                      <TableRow className="even:bg-[#2f1107] hover:bg-[#2f1107]/30 border-none even:text-white" key={event.id}>
                        <TableCell className="font-medium">{startIndex + idx + 1}</TableCell>
                        <TableCell>{formattedEventDate}</TableCell>
                        <TableCell>{event?.city}</TableCell>
                        <TableCell>{event?.country}</TableCell>
                        <TableCell>{formattedCreatedDate}</TableCell>
                        <TableCell>{event?.isClosed ? "True" : "False"}</TableCell>
                        <TableCell>{event?.admin?.email}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger className='bg-red-500 rounded-md p-2 transition-colors duration-300 cursor-pointer text-white hover:bg-red-600'>
                              <FaTrashCan size={16} />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Event Deletion</DialogTitle>
                                <DialogDescription>
                                  Deleting this event is permanent. All event details, registrations,
                                  and related records will be removed from the system.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="sm:justify-start">
                                <DialogClose asChild>
                                  <Button type="button" className='cursor-pointer'>Close</Button>
                                </DialogClose>
                                <Button disabled={removeLoading} onClick={() => mutate({ eventId: event?.id })} type="button" className='bg-red-600 rounded-md p-2 transition-colors duration-300 cursor-pointer text-white hover:bg-red-800'>
                                  {removeLoading ? "Confirming..." : "Confirm"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
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

              {/* Optional: Page indicator */}
              <span className="px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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