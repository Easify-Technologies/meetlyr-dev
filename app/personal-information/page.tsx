'use client';

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';
import { useProfileDetails } from '../queries/profile';
import { useEditUserDetails } from '../queries/edit-user-details';
import { useSession } from 'next-auth/react';
import Loader from '@/components/ui/loader';

import PhoneNumberInput from '@/components/comp-46';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Page = () => {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const { data: profile, isLoading } = useProfileDetails(email);
  const { mutate, isSuccess, isError, error, data } = useEditUserDetails(email);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    mutate(formData);
  }

  useEffect(() => {
    if (profile) {
      const [first, ...last] = profile.name.split(" ");

      setFormData({
        first_name: first,
        last_name: last.join(" "),
        email: profile.email,
        phone_number: profile.phoneNumber,
        date_of_birth: profile.dateOfBirth || "",
        gender: profile.gender || "",
      });

      if (profile.dateOfBirth) {
        setDate(new Date(profile.dateOfBirth));
      }
    }
  }, [profile]);

  if (isLoading) return <Loader />;

  return (
    <>
      <Navbar />

      <section className="w-full h-screen bg-[#FFFFF5]">
        <div className="max-w-2xl mx-auto py-8 md:px-0 px-4">
          {/* Header */}
          <div className="flex flex-row gap-1.5 items-center justify-center flex-nowrap">
            <Link
              href="/settings"
              className="rounded-full hover:bg-[#2f1107] hover:text-white flex items-center justify-center p-2 mt-2 transition-colors duration-300"
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
            <h3 className="text-2xl md:text-3xl font-bold">Personal Information</h3>
          </div>

          {/* Form */}
          <form className="w-full mt-5">
            {/* First Name */}
            <div className="flex flex-col gap-2 items-start justify-start">
              <label htmlFor="first_name" className="text-[#2f1107] font-semibold">
                First Name
              </label>
              <input
                onChange={handleInputChange}
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                className="w-full rounded-md border border-[#2f1107] text-[#2f1107] outline-none text-sm font-semibold p-2"
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-2 items-start justify-start mt-6">
              <label htmlFor="last_name" className="text-[#2f1107] font-semibold">
                Last Name
              </label>
              <input
                onChange={handleInputChange}
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                className="w-full rounded-md border border-[#2f1107] text-[#2f1107] outline-none text-sm font-semibold p-2"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 items-start justify-start mt-6">
              <label htmlFor="email" className="text-[#2f1107] font-semibold">
                Email
              </label>
              <input
                onChange={handleInputChange}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                className="w-full rounded-md border border-[#2f1107] text-[#2f1107] outline-none text-sm font-semibold p-2"
              />
            </div>

            {/* Phone Number */}
            <PhoneNumberInput
              phone={formData.phone_number}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, phone_number: value }))
              }
            />

            {/* Date of Birth */}
            <div className="flex flex-col gap-2 items-start justify-start mt-6">
              <label htmlFor="date_of_birth" className="text-[#2f1107] font-semibold">
                Date of birth
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full p-5 rounded-md justify-between bg-transparent border border-[#2f1107] text-[#2f1107] outline-none text-sm font-semibold"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(newDate) => {
                      setDate(newDate);
                      setFormData((prev) => ({
                        ...prev,
                        date_of_birth: newDate
                          ? newDate.toISOString().split("T")[0]
                          : "",
                      }));
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2 items-start justify-start mt-6">
              <label htmlFor="gender" className="text-[#2f1107] font-semibold">
                Gender
              </label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, gender: value }))
                }
                className="flex gap-2 items-center justify-center w-full mx-auto py-3"
              >
                <label
                  htmlFor="male"
                  className="relative w-1/2 flex cursor-pointer flex-col items-center gap-3 rounded-full border border-input px-2 py-5 text-center shadow-xs transition-all has-[input:checked]:bg-blue-100 has-[input:checked]:border-blue-500"
                >
                  <RadioGroupItem id="male" value="male" className="sr-only" />
                  <p className="text-sm leading-none font-bold text-foreground">Male</p>
                </label>

                <label
                  htmlFor="female"
                  className="relative w-1/2 flex cursor-pointer flex-col items-center gap-3 rounded-full border border-input px-2 py-5 text-center shadow-xs transition-all has-[input:checked]:bg-pink-100 has-[input:checked]:border-pink-500"
                >
                  <RadioGroupItem id="female" value="female" className="sr-only" />
                  <p className="text-sm leading-none font-bold text-foreground">Female</p>
                </label>
                <label
                  htmlFor="other"
                  className="relative w-1/2 flex cursor-pointer flex-col items-center gap-3 rounded-full border border-input px-2 py-5 text-center shadow-xs transition-all
                  data-[state=checked]:bg-yellow-100
                  data-[state=checked]:border-yellow-500
                  focus-within:ring-2
                  focus-within:ring-yellow-300"
                >
                  <RadioGroupItem
                    value="other"
                    id="other"
                    className="sr-only peer"
                  />
                  <span className="text-sm leading-none font-bold text-foreground peer-data-[state=checked]:text-yellow-700">
                    Other
                  </span>
                </label>
              </RadioGroup>
            </div>

            {isError && (
              <p data-slot="form-message" className="text-destructive text-sm font-semibold">{(error as Error).message}</p>
            )}
            {isSuccess && data?.message && (
              <p data-slot="form-message" className="text-green-500 text-sm font-semibold">{data.message}</p>
            )}

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveChanges}
              className="w-full mt-6 bg-[#2f1107] rounded-full text-white transition-colors duration-500 cursor-pointer text-sm font-semibold py-4 hover:bg-[#2f1107]/90"
            >
              Save Changes
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Page;