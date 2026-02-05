'use client';

import React, { useState } from 'react';

import { useFetchAllLocations } from '@/app/queries/fetch-locations';
import { useAddCafes } from '@/app/queries/admin/add-cafe';

interface CafeProps {
  name: string;
  address: string;
  locationId: string;
  imageUrl: File | null;
}

const Page = () => {
  const [formData, setFormData] = useState<CafeProps>({
    name: "",
    address: "",
    locationId: "",
    imageUrl: null
  });

  const { name, address, locationId } = formData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const { data: cafes } = useFetchAllLocations();
  const { mutate, isPending, data, isError, isSuccess, error } = useAddCafes();

  const handleSaveCafe = () => {
    mutate(formData);
  }

  return (
    <>
      <section className="w-screen md:w-full min-h-screen bg-[#FFFFF5] relative">
        <div className="w-[inherit] mx-auto py-8 px-4 md:px-8 flex flex-col justify-center md:items-start items-center">
          <form encType='multipart/form-data' className="flex flex-col  w-full gap-4 max-w-sm">
            <h1 className="text-4xl text-[#2f1107] font-semibold md:text-5xl lg:text-6xl text-center mb-4">Add Cafe</h1>
            <div className="grid w-full items-center gap-3">
              <div className="relative">
                <input onChange={handleInputChange} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm" aria-placeholder="Name" placeholder="Name" id="name" type="text" value={name} name="name" />
                <input onChange={handleInputChange} className="file:text-foreground mt-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm" aria-placeholder="Address" placeholder="Address" id="address" type="text" value={address} name="address" />
                <select onChange={handleInputChange} className="file:text-foreground mt-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm" name="locationId" id="locationId" value={locationId}>
                  <option value="">Select City</option>
                  {cafes?.map((cafe: { id: string; city: string }, idx: React.Key) => (
                    <option key={cafe.id || idx} value={cafe.id}>
                      {cafe.city}
                    </option>
                  ))}
                </select>
                <input
                  onChange={handleFileChange}
                  type="file"
                  name="imageUrl"
                  id="imageUrl"
                  className="mt-5 w-full min-w-0 rounded-full border border-gray-300 bg-gray-100 px-5 py-3 text-base text-gray-700
                  transition-colors duration-200 outline-none
                  file:mr-4 file:rounded-full file:border-0 file:bg-[#2f1107] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white
                  file:hover:bg-[#2f1107]/90
                  placeholder:text-gray-400
                  focus:border-[#2f1107] focus:ring-1"
                />
              </div>
              {isError && (
                <p data-slot="form-message" className="text-destructive text-sm">{(error as Error).message}</p>
              )}
              {isSuccess && data?.message && (
                <p data-slot="form-message" className="text-green-500 text-sm">{data.message}</p>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-4 justify-center items-center">
              <button onClick={handleSaveCafe} disabled={isPending} className="inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer text-sm md:text-base font-medium transition-all bg-[#FFD100] text-[#2f1107] hover:bg-[#FFD100]/90 h-12 px-4 py-2 rounded-full w-full" type="button">
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default Page