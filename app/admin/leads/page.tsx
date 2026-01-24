'use client';

import { useEffect, useState } from 'react';
import { useFetchUserLeads } from '@/app/queries/admin/user-leads';
import { parseISO, format } from "date-fns";
import { MdOutlineFileDownload } from "react-icons/md";
import Link from 'next/link';

import Loader from '@/components/ui/loader';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const page = () => {
    const { data: leads, isPending } = useFetchUserLeads();

    const ITEMS_PER_PAGE = 10;

    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = leads?.length ?? 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginatedLeads = leads?.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [leads]);

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
                            <h3 className="text-2xl md:text-3xl font-bold">All Leads</h3>
                            <button onClick={() => window.open("/api/admin/export-leads")} type="button" className='ml-7 flex items-center justify-center gap-2 bg-[#ffd100] text-[#2f1107] hover:bg-[#2f1107] hover:text-[#ffd100] transition-colors duration-300 rounded-full cursor-pointer px-4 py-2.5 text-base'>
                                <span>Export</span>
                                <MdOutlineFileDownload size={20} />
                            </button>
                        </div>
                    </div>
                    <div className='w-full mt-10'>
                        <div className="[&>div]:max-h-96">
                            <Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                                <TableHeader className="sticky top-0 bg-[#ffd100] backdrop-blur-xs">
                                    <TableRow className="border-none">
                                        <TableHead className='text-[#2f1107]'>S. No</TableHead>
                                        <TableHead className='text-[#2f1107]'>Name</TableHead>
                                        <TableHead className='text-[#2f1107]'>Email</TableHead>
                                        <TableHead className='text-[#2f1107]'>Status</TableHead>
                                        <TableHead className='text-[#2f1107]'>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads && paginatedLeads.map((lead: any, index: number) => {
                                        const isoCreatedAt = lead?.createdAt;
                                        const formattedDate = format(parseISO(isoCreatedAt), "EEEE, MMM do h:mm a");

                                        return (
                                            <TableRow className="even:bg-[#2f1107] hover:bg-[#2f1107]/30 border-none even:text-white" key={lead.id}>
                                                <TableCell>{startIndex + index + 1}</TableCell>
                                                <TableCell>{lead?.name}</TableCell>
                                                <TableCell>{lead?.email}</TableCell>
                                                <TableCell className='capitalize'>{lead?.status}</TableCell>
                                                <TableCell>{formattedDate}</TableCell>
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

export default page