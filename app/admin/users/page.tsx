'use client';

import React from 'react';
import Link from 'next/link';
import Loader from '@/components/ui/loader';
import { useFetchAllUsers } from '@/app/queries/admin/fetch-users';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface UserProps {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    gender: string;
    city: string;
    country: string;
    dateOfBirth: string;
    connectionStyles: string;
    communicationStyles: string;
    socialStyles: string;
    healthAndFitness: string;
    family: string;
    spirituality: string;
    politicalNews: string;
    incorrectHumor: string;
    kindOfPeople: string[];
}

const Page = () => {
    const { data: users, isPending } = useFetchAllUsers();

    if (isPending) return <Loader />

    return (
        <>
            <section className="w-full min-h-screen bg-[#FFFFF5] relative">
                <div className="w-full mx-auto py-8 px-4 md:px-8">
                    {/* Header */}
                    <div className="flex flex-row gap-2 items-center flex-nowrap">
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
                        <h3 className="text-2xl md:text-3xl font-bold">All Users</h3>
                    </div>

                    {/* Table (desktop) */}
                    <div className="hidden md:block w-full mt-10 overflow-x-auto">
                        <div className="[&>div]:max-h-[70vh]">
                            <Table className="min-w-full border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                                <TableHeader className="sticky top-0 bg-[#ffd100] backdrop-blur-xs">
                                    <TableRow className="border-none">
                                        {[
                                            "S. No",
                                            "Name",
                                            "Email",
                                            "Phone Number",
                                            "Gender",
                                            "Date Of Birth",
                                            "City",
                                            "Country",
                                            "Connection Style",
                                            "Communication Style",
                                            "Family",
                                            "Humor",
                                            "Health & Fitness",
                                            "Politics",
                                            "Kind of People",
                                        ].map((heading, i) => (
                                            <TableHead key={i} className="text-[#2f1107] whitespace-nowrap">
                                                {heading}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users?.map((user: UserProps, idx: number) => (
                                        <TableRow
                                            key={user.id}
                                            className="even:bg-[#2f1107] hover:bg-[#2f1107]/30 border-none even:text-white"
                                        >
                                            <TableCell className="font-medium">{idx + 1}</TableCell>
                                            <TableCell>{user?.name}</TableCell>
                                            <TableCell>{user?.email}</TableCell>
                                            <TableCell>{user?.phoneNumber}</TableCell>
                                            <TableCell>{user?.gender}</TableCell>
                                            <TableCell>{user?.dateOfBirth}</TableCell>
                                            <TableCell>{user?.city}</TableCell>
                                            <TableCell>{user?.country}</TableCell>
                                            <TableCell>{user?.connectionStyles}</TableCell>
                                            <TableCell>{user?.communicationStyles}</TableCell>
                                            <TableCell>{user?.family}</TableCell>
                                            <TableCell>{user?.incorrectHumor}</TableCell>
                                            <TableCell>{user?.healthAndFitness}</TableCell>
                                            <TableCell>{user?.politicalNews}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {user?.kindOfPeople?.join(", ")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Card layout (mobile) */}
                    <div className="md:hidden mt-8 space-y-4">
                        {users?.map((user: UserProps, idx: number) => (
                            <div
                                key={user.id}
                                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h4 className="font-bold text-lg text-[#2f1107]">{user?.name}</h4>
                                    <span className="text-sm text-gray-500">#{idx + 1}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                                    <p><span className="font-semibold">Email:</span> {user?.email}</p>
                                    <p><span className="font-semibold">Phone:</span> {user?.phoneNumber}</p>
                                    <p><span className="font-semibold">Gender:</span> {user?.gender}</p>
                                    <p><span className="font-semibold">DOB:</span> {user?.dateOfBirth}</p>
                                    <p><span className="font-semibold">City:</span> {user?.city}</p>
                                    <p><span className="font-semibold">Country:</span> {user?.country}</p>
                                    <p><span className="font-semibold">Connection:</span> {user?.connectionStyles}</p>
                                    <p><span className="font-semibold">Communication:</span> {user?.communicationStyles}</p>
                                    <p><span className="font-semibold">Family:</span> {user?.family}</p>
                                    <p><span className="font-semibold">Humor:</span> {user?.incorrectHumor}</p>
                                    <p><span className="font-semibold">Health & Fitness:</span> {user?.healthAndFitness}</p>
                                    <p><span className="font-semibold">Politics:</span> {user?.politicalNews}</p>
                                    <p className="col-span-2">
                                        <span className="font-semibold">Kind of People:</span>{" "}
                                        {user?.kindOfPeople?.join(", ")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Page