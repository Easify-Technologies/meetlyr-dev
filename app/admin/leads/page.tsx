'use client';

import React from 'react';
import Link from 'next/link';
import { useFetchUserLeads } from '@/app/queries/admin/user-leads';
import { parseISO, format } from "date-fns";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Loader from '@/components/ui/loader';

const page = () => {
    const { data: leads, isPending } = useFetchUserLeads();

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
                                    {leads && leads.map((lead: any, index: number) => {
                                        const isoCreatedAt = lead?.createdAt;
                                        const formattedDate = format(parseISO(isoCreatedAt), "EEEE, MMM do h:mm a");

                                        return (
                                            <TableRow className="even:bg-[#2f1107] hover:bg-[#2f1107]/30 border-none even:text-white" key={lead.id}>
                                                <TableCell>{index + 1}</TableCell>
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
                </div>
            </section>
        </>
    )
}

export default page