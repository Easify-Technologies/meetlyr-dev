'use client';

import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Loader from '@/components/ui/loader';
import { MdOutlineFileDownload } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import { useFetchAllUsers } from '@/app/queries/admin/fetch-users';
import { useFetchAllLocations } from '@/app/queries/fetch-locations';
import { useUpdateCredits } from '@/app/queries/update-credits';
import { Label } from '@/components/ui/label';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

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
    avatar: string;
    healthAndFitness: string;
    family: string;
    spirituality: string;
    politicalNews: string;
    incorrectHumor: string;
    payment: [{
        mode: string;
        status: string;
    }];
    kindOfPeople: string[];
}

interface LocationProps {
    id: string;
    city: string;
    country: string;
}

const Page = () => {
    const { data: users, isPending } = useFetchAllUsers();
    const { data: locations } = useFetchAllLocations();
    const { mutate, isPending: creditsPending, isSuccess, isError, data, error } = useUpdateCredits();

    const [searchTerm, setSearchTerm] = useState({
        name: "",
        country: "",
        gender: ""
    });
    const [credits, setCredits] = useState(1);

    const { name, country, gender } = searchTerm;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchTerm({ ...searchTerm, [name]: value });
    }

    const deferredName = useDeferredValue(name);
    const deferredCountry = useDeferredValue(country);
    const deferredGender = useDeferredValue(gender);

    const filteredUsers = useMemo(() => {
        return users?.filter((item: { name: string; country: string; gender: string; }) => {
            return (
                (deferredName === "" || item.name.toLowerCase().includes(deferredName.toLowerCase())) &&
                (deferredCountry === "" || item.country.toLowerCase().includes(deferredCountry.toLowerCase())) &&
                (deferredGender === "" || item.gender.toLowerCase().includes(deferredGender.toLowerCase()))
            );
        });
    }, [users, deferredName, deferredCountry, deferredGender]);

    const ITEMS_PER_PAGE = 10;

    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = filteredUsers?.length ?? 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginatedUsers = filteredUsers?.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredUsers]);

    if (isPending) return <Loader />

    return (
        <>
            <section className="w-full min-h-screen bg-[#FFFFF5] relative overflow-x-hidden">
                <div className="w-full mx-auto py-8 px-4 md:px-8">
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
                            <h3 className="text-2xl md:text-3xl font-bold">All Users</h3>
                        </div>
                        <div className='flex flex-col md:flex-row md:items-center items-start gap-3.5'>
                            <input className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-12 min-w-0 rounded-full border bg-muted px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm' type="text" name='name' value={name} onChange={handleInputChange} placeholder='Seacrh by name' />
                            <select className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-12 min-w-0 rounded-full border bg-muted px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm' name="country" value={country} onChange={handleInputChange}>
                                <option value="">Select Country</option>
                                {locations?.map((loc: LocationProps) => (
                                    <option key={loc.id} value={loc.country}>{loc.country}</option>
                                ))}
                            </select>
                            <select className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-12 min-w-0 rounded-full border bg-muted px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm' name="gender" value={gender} onChange={handleInputChange}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Others">Others</option>
                            </select>
                            <button onClick={() => window.open("/api/admin/export-users")} type="button" className='flex items-center justify-center gap-2 bg-[#ffd100] text-[#2f1107] hover:bg-[#2f1107] hover:text-[#ffd100] transition-colors duration-300 rounded-full cursor-pointer px-4 py-2.5 text-base'>
                                <span>Export</span>
                                <MdOutlineFileDownload size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Table (desktop) */}
                    <div className="hidden md:block w-full mt-10">
                        <div className='overflow-x-auto max-h-[70vh]'>
                            <div className="[&>div]:max-h-[70vh]">
                                <Table className="min-w-full border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                                    <TableHeader className="sticky top-0 bg-[#ffd100] backdrop-blur-xs z-10">
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
                                                "Payment Mode",
                                                "Payment Status",
                                                "Image",
                                                "Action"
                                            ].map((heading, i) => (
                                                <TableHead key={i} className="text-[#2f1107] whitespace-nowrap">
                                                    {heading}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedUsers?.map((user: UserProps, idx: number) => {
                                            const isSpecial = user?.payment?.[0]?.mode === "special";

                                            return (
                                                <TableRow
                                                    key={user.id}
                                                    className={`even:bg-[#2f1107] hover:bg-[#2f1107]/30 border-none even:text-white ${isSpecial ? "ring-2 ring-yellow-400" : ""
                                                        }`}
                                                >
                                                    <TableCell className="font-medium">{startIndex + idx + 1}</TableCell>
                                                    <TableCell>{user?.name}</TableCell>
                                                    <TableCell>{user?.email}</TableCell>
                                                    <TableCell>{user?.phoneNumber}</TableCell>
                                                    <TableCell className='capitalize'>{user?.gender}</TableCell>
                                                    <TableCell>{user?.dateOfBirth}</TableCell>
                                                    <TableCell>{user?.city}</TableCell>
                                                    <TableCell>{user?.country}</TableCell>
                                                    <TableCell>{user?.connectionStyles}</TableCell>
                                                    <TableCell>{user?.communicationStyles}</TableCell>
                                                    <TableCell>{user?.family} / 10</TableCell>
                                                    <TableCell>{user?.incorrectHumor} / 10</TableCell>
                                                    <TableCell>{user?.healthAndFitness}</TableCell>
                                                    <TableCell>{user?.politicalNews} / 10</TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {user?.kindOfPeople?.join(", ")}
                                                    </TableCell>
                                                    <TableCell className="capitalize">
                                                        {isSpecial ? (
                                                            <span className="bg-[#00916E] text-white text-xs font-semibold px-2 py-1 rounded-md">
                                                                Special
                                                            </span>
                                                        ) : (
                                                            user?.payment?.[0]?.mode ?? "---"
                                                        )}
                                                    </TableCell>
                                                    <TableCell className='capitalize'>{user?.payment?.[0]?.status ?? "---"}</TableCell>
                                                    <TableCell>
                                                        <Image
                                                            className='w-[50px] h-[50px] object-cover'
                                                            src={user?.avatar}
                                                            alt={user?.name}
                                                            width={50}
                                                            height={50}
                                                            quality={100}
                                                            priority
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {(user?.payment?.[0]?.mode === "subscription" && user?.payment?.[0]?.status === "paid") ? (
                                                            <Dialog>
                                                                <DialogTrigger className='bg-green-600 rounded-md text-white cursor-pointer flex items-center justify-center p-2 transition-colors duration-300 hover:bg-green-700'>
                                                                    <HiPencilSquare size={18} />
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Edit Subscription</DialogTitle>
                                                                        <div className="flex flex-col gap-2 mt-3">
                                                                            <Label className="text-sm font-semibold text-[#2f1107]">
                                                                                Credits
                                                                            </Label>

                                                                            <input
                                                                                className="bg-muted px-5 py-2 outline-none border-0 rounded-lg w-full h-12 text-[#2F1107] font-medium text-base"
                                                                                type="number"
                                                                                name="credits"
                                                                                id="credits"
                                                                                value={credits}
                                                                                min={1}
                                                                                max={10}
                                                                                onChange={(e) => setCredits(Number(e.target.value))}
                                                                            />
                                                                        </div>
                                                                        {isError && (
                                                                            <p
                                                                                data-slot="form-message"
                                                                                className="text-destructive text-sm"
                                                                            >
                                                                                {(error as Error).message}
                                                                            </p>
                                                                        )}
                                                                        {isSuccess && data?.message && (
                                                                            <p data-slot="form-message" className="text-green-500 text-sm">
                                                                                {data.message}
                                                                            </p>
                                                                        )}
                                                                        <button disabled={creditsPending} onClick={() => {
                                                                            mutate({
                                                                                credits,
                                                                                userId: user.id
                                                                            })
                                                                        }} type="button" className='bg-[#ffd100] text-[#2f1107] mt-1 rounded-md text-sm font-semibold p-2 cursor-pointer transition-colors duration-300 hover:bg-[#2f1107] hover:text-[#ffd100]'>
                                                                            {creditsPending ? "Updating..." : "Update"}
                                                                        </button>
                                                                    </DialogHeader>
                                                                </DialogContent>
                                                            </Dialog>
                                                        ) : (
                                                            "---"
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    {/* Card layout (mobile) */}
                    <div className="md:hidden mt-8 space-y-4">
                        {paginatedUsers?.map((user: UserProps, idx: number) => {
                            const isSpecial = user?.payment?.[0]?.mode === "special";

                            return (
                                <div
                                    key={user.id}
                                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-2"
                                >
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="font-bold text-lg text-[#2f1107]">{user?.name}</h4>
                                        <span className="text-sm text-gray-500">#{startIndex + idx + 1}</span>
                                    </div>
                                    <Image
                                        className='w-[60px] h-[60px] object-cover'
                                        src={user?.avatar}
                                        alt={user?.name}
                                        width={60}
                                        height={60}
                                        quality={100}
                                        priority
                                    />
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                                        <p><span className="font-semibold">Email:</span> {user?.email}</p>
                                        <p><span className="font-semibold">Phone:</span> {user?.phoneNumber}</p>
                                        <p className='capitalize'><span className="font-semibold">Gender:</span> {user?.gender}</p>
                                        <p><span className="font-semibold">DOB:</span> {user?.dateOfBirth}</p>
                                        <p><span className="font-semibold">City:</span> {user?.city}</p>
                                        <p><span className="font-semibold">Country:</span> {user?.country}</p>
                                        <p><span className="font-semibold">Connection:</span> {user?.connectionStyles}</p>
                                        <p><span className="font-semibold">Communication:</span> {user?.communicationStyles}</p>
                                        <p><span className="font-semibold">Family:</span> {user?.family} / 10</p>
                                        <p><span className="font-semibold">Humor:</span> {user?.incorrectHumor} / 10</p>
                                        <p><span className="font-semibold">Health & Fitness:</span> {user?.healthAndFitness}</p>
                                        <p><span className="font-semibold">Politics:</span> {user?.politicalNews} / 10</p>
                                        <p className="col-span-2">
                                            <span className="font-semibold">Kind of People: </span>
                                            {user?.kindOfPeople?.join(", ")}
                                        </p>
                                        <p className='capitalize'><span className="font-semibold">Payment Mode: </span>
                                            {isSpecial ? (
                                                <span className="bg-[#00916E] text-white text-xs font-semibold px-2 py-1 rounded-md">
                                                    Special
                                                </span>
                                            ) : (
                                                user?.payment?.[0]?.mode ?? "---"
                                            )}
                                        </p>
                                        <p className='capitalize'><span className="font-semibold">Payment Status:</span> {user?.payment?.[0]?.status ?? "---"}</p>
                                        {(user?.payment?.[0]?.mode === "subscription" && user?.payment?.[0]?.status === "paid") ? (
                                            <Dialog>
                                                <DialogTrigger className='bg-green-600 rounded-md text-white cursor-pointer mt-1.5 flex items-center justify-center p-2 transition-colors duration-300 hover:bg-green-700'>
                                                    <HiPencilSquare size={18} />
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Subscription</DialogTitle>
                                                        <div className="flex flex-col gap-2 mt-3">
                                                            <Label className="text-sm font-semibold text-[#2f1107]">
                                                                Credits
                                                            </Label>

                                                            <input
                                                                className="bg-muted px-5 py-2 outline-none border-0 rounded-lg w-full h-12 text-[#2F1107] font-medium text-base"
                                                                type="number"
                                                                name="credits"
                                                                id="credits"
                                                                value={credits}
                                                                min={1}
                                                                max={10}
                                                                onChange={(e) => setCredits(Number(e.target.value))}
                                                            />
                                                        </div>
                                                        {isError && (
                                                            <p
                                                                data-slot="form-message"
                                                                className="text-destructive text-sm"
                                                            >
                                                                {(error as Error).message}
                                                            </p>
                                                        )}
                                                        {isSuccess && data?.message && (
                                                            <p data-slot="form-message" className="text-green-500 text-sm">
                                                                {data.message}
                                                            </p>
                                                        )}
                                                        <button disabled={creditsPending} onClick={() => {
                                                            mutate({
                                                                credits,
                                                                userId: user.id
                                                            })
                                                        }} type="button" className='bg-[#ffd100] text-[#2f1107] mt-1 rounded-md text-sm font-semibold p-2 cursor-pointer transition-colors duration-300 hover:bg-[#2f1107] hover:text-[#ffd100]'>
                                                            {creditsPending ? "Updating..." : "Update"}
                                                        </button>
                                                    </DialogHeader>
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            null
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {/* Pagination */}
                    <Pagination className="mt-6">
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