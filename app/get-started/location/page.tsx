"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/ui/loader";
import { useFetchAllLocations } from "@/app/queries/fetch-locations";
// import { useFetchAllLocations } from "../queries/fetch-locations";

interface Location {
  id: string;
  city: string;
  country: string;
  imageUrl: string;
}

const Page = () => {
  const searchParams = useSearchParams();
  const country = searchParams.get("country") ?? ""; // ✅ comes from country selection page

  const { data: locations = [], isPending } = useFetchAllLocations();
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  // ✅ Filter locations by selected country
  const filteredCities = useMemo(() => {
    return locations.filter((loc: Location) => loc.country === country);
  }, [locations, country]);

  if (isPending) return <Loader />;
  if (!filteredCities.length)
    return (
      <div className="flex justify-center items-center h-full text-xl">
        No cities found for {country}.
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto h-full">
          <div className="h-full flex flex-col p-4">
            {/* Header */}
            <div className="grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center min-h-0 lg:min-h-20 p-4 w-full">
              <div className="flex items-center gap-2 w-20">
                <Image
                  src="/Mocha-e1760632297719.webp"
                  alt="Meetly"
                  width={200}
                  height={200}
                  quality={100}
                  priority
                />
              </div>
            </div>

            {/* Cities */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto flex flex-col gap-6 text-center px-4 pt-10 pb-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#2F1107] font-semibold">
                    Select your city
                  </h1>
                  <p className="text-base md:text-lg text-[#2F1107]">
                    Showing cities in {country}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                    {filteredCities.map((city: Location) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => setSelectedCityId(city.id)}
                        className={`group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md hover:scale-[1.02] ${
                          selectedCityId === city.id
                            ? "border-[#2F1107] ring-2 ring-[#FFD100]"
                            : ""
                        }`}
                      >
                        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                          <Image
                            width={100}
                            height={100}
                            alt={city.city}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            src={city.imageUrl}
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm line-clamp-1">
                            {city.city}
                          </h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="p-4 bg-background flex gap-4">
                  <Link
                    href="/get-started"
                    className="inline-flex items-center justify-center gap-2 text-sm font-medium transition-all bg-gray-200 text-[#2F1107] hover:bg-gray-300 h-12 px-4 py-2 rounded-full w-1/2"
                  >
                    Back
                  </Link>

                  <Link
                    href={
                      selectedCityId
                        ? `/get-started/user-details?city_id=${selectedCityId}`
                        : "#"
                    }
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all select-none h-12 px-4 py-2 rounded-full w-full duration-500 ${
                      selectedCityId
                        ? "bg-[#FFD100] text-[#2F1107] hover:bg-[#2F1107] hover:text-[#FFD100]"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side image */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-muted">
          <div className="absolute right-1/8 h-2/3 w-auto">
            <Image
              src="/colleagues-having-a-coffee-break-1024x752.webp"
              alt="Meetly"
              width={600}
              height={600}
              quality={100}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
