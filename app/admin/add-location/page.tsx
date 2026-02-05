'use client';

import React, { useState } from 'react';
import { useAddLocation } from '@/app/queries/admin/add-location';

interface LocationProps {
  city: string,
  country: string,
  imageUrl: File | null,
}

const Page = () => {
  const [formData, setFormData] = useState<LocationProps>({
    city: "",
    country: "",
    imageUrl: null
  });

  const { city, country } = formData;
  const { mutate, isPending, isSuccess, isError, data, error } = useAddLocation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageUrl: file }));
    }
  };

  const handleSaveLocation = () => {
    mutate(formData);
  }

  return (
    <>
      <section className="w-screen md:w-full min-h-screen bg-[#FFFFF5] relative">
        <div className="w-[inherit] mx-auto py-8 px-4 md:px-8 flex flex-col justify-center md:items-start items-center">
          <form
            encType="multipart/form-data"
            className="flex flex-col w-full gap-4 max-w-md md:max-w-lg"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#2f1107] font-semibold md:text-left text-center mb-4">
              Add Location
            </h1>

            <div className="grid w-full items-center gap-3">
              {/* Country Input */}
              <input
                onChange={handleInputChange}
                className="mb-4 placeholder:text-muted-foreground border-input flex h-14 w-full rounded-full border bg-muted px-5 py-2 text-base outline-none transition-colors focus:border-[#2f1107] focus:ring-1"
                placeholder="Country"
                id="country"
                type="text"
                value={country}
                name="country"
              />

              {/* City Input */}
              <input
                onChange={handleInputChange}
                className="placeholder:text-muted-foreground border-input flex h-14 w-full rounded-full border bg-muted px-5 py-2 text-base outline-none transition-colors focus:border-[#2f1107] focus:ring-1"
                placeholder="City"
                id="city"
                type="text"
                value={city}
                name="city"
              />

              {/* File Upload */}
              <input
                type="file"
                name="imageUrl"
                id="imageUrl"
                onChange={handleFileChange}
                className="mt-4 w-full rounded-full border border-gray-300 bg-gray-100 px-5 py-3 text-base text-gray-700
                transition-colors duration-200 outline-none
                file:mr-4 file:rounded-full file:border-0 file:bg-[#2f1107] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white
                file:hover:bg-[#2f1107]/90
                placeholder:text-gray-400
                focus:border-[#2f1107] focus:ring-1"
              />
            </div>

            {/* Status Messages */}
            {isError && (
              <p className="text-destructive text-sm mt-2">
                {(error as Error).message}
              </p>
            )}
            {isSuccess && data?.message && (
              <p className="text-green-500 text-sm mt-2">{data.message}</p>
            )}

            {/* Save Button */}
            <div className="flex flex-col gap-4 justify-center items-center md:items-start">
              <button
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer text-sm md:text-base font-medium transition-all bg-[#FFD100] text-[#2f1107] hover:bg-[#FFD100]/90 h-12 px-6 rounded-full w-full md:w-auto"
                type="button"
                onClick={handleSaveLocation}
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default Page