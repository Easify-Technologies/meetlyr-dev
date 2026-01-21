'use client';

import React, { useState, useMemo, useDeferredValue } from 'react';
import Link from 'next/link';
import { useFetchAllCafes } from '@/app/queries/fetch-cafes';
import { useFetchAllLocations } from '@/app/queries/fetch-locations';
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
import Image from 'next/image';

interface CafesProps {
  id: string;
  name: string;
  address: string;
  location: {
    city: string;
  };
  imageUrl: string;
}

const Page = () => {
  const { data: cafes, isPending } = useFetchAllCafes();
  const { data: locations } = useFetchAllLocations();

  const [city, setCity] = useState<string>("");
  const deferredCity = useDeferredValue(city);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
  }

  const filteredCafes = useMemo(() => {
    if(!deferredCity) return cafes;

    return cafes?.filter((cafe: CafesProps) => cafe.location.city === deferredCity);
  }, [cafes, deferredCity]);

  if (isPending) return <Loader />

  return (
    <>
      <section className='w-screen min-h-screen bg-[#FFFFF5] relative'>
        <div className="w-full mx-auto py-8 md:px-8 px-4">
          {/* Header */}
          <div className="flex md:flex-row flex-col md:items-center items-start md:justify-between justify-start md:gap-0 gap-4">
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
              <h3 className="text-2xl md:text-3xl font-bold">All Cafes</h3>
            </div>
            <div className='flex items-center gap-3'>
              <select onChange={handleInputChange} value={city} className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-12 min-w-0 rounded-full border bg-muted px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm' name="city" id="city">
                <option value="">Select City</option>
                {locations?.map((loc: { id: string; city: string; }) => (
                  <option key={loc.id} value={loc.city}>{loc.city}</option>
                ))}
              </select>
              <Link href="/admin/add-cafe" className='bg-[#ffd100] text-[#2f1107] rounded-md transition-colors duration-300 p-2 text-sm font-semibold border border-[#2f1107] flex items-center gap-2 hover:bg-[#2f1107] hover:text-[#ffd100]'>
                <FaPlus />
                <span>Add Cafe</span>
              </Link>
            </div>
          </div>

          {/* Cafe Table */}
          <div className='w-full mt-10'>
            <div className="[&>div]:max-h-96">
              <Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                <TableHeader className="sticky top-0 bg-[#ffd100] backdrop-blur-xs">
                  <TableRow className="border-none">
                    <TableHead className='text-[#2f1107]'>S. No</TableHead>
                    <TableHead className='text-[#2f1107]'>Name</TableHead>
                    <TableHead className='text-[#2f1107]'>Address</TableHead>
                    <TableHead className='text-[#2f1107]'>Location</TableHead>
                    <TableHead className='text-[#2f1107]'>Image</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCafes?.map((cafe: CafesProps, idx: number) => (
                    <TableRow className="even:bg-[#2f1107] hover:bg-[#2f1107]/30 border-none even:text-white" key={cafe.id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>{cafe?.name}</TableCell>
                      <TableCell>{cafe?.address}</TableCell>
                      <TableCell>{cafe?.location?.city}</TableCell>
                      <TableCell>
                        <Image
                          className='w-[50px] h-[50px] object-cover'
                          src={cafe?.imageUrl}
                          alt={cafe?.name}
                          width={50}
                          height={50}
                          quality={100}
                          priority
                        />
                      </TableCell>
                    </TableRow>
                  ))}
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