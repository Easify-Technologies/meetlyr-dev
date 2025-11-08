"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/ui/loader";
import { useFetchAllLocations } from "../queries/fetch-locations";

interface Locations {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
}

const Page = () => {
  const router = useRouter();
  const { data: locations = [], isPending } = useFetchAllLocations();

  // ✅ Extract unique countries
  const countries = useMemo(() => {
    const unique = new Map<string, string>();
    locations.forEach((loc: Locations) => {
      if (!unique.has(loc.country)) unique.set(loc.country, loc.imageUrl);
    });
    return Array.from(unique, ([country, imageUrl]) => ({ country, imageUrl }));
  }, [locations]);

  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* LEFT SECTION */}
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

            {/* Main content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto flex flex-col gap-6 text-center px-4 pt-10 pb-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#2F1107] font-semibold">
                    Select your country
                  </h1>
                  <p className="text-base md:text-lg text-[#2F1107]">
                    You can change this anytime
                  </p>

                  {/* Country list */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                    {countries.map(({ country, imageUrl }) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() =>
                          router.push(
                            `/get-started/location?country=${encodeURIComponent(
                              country
                            )}`
                          )
                        }
                        className="group cursor-pointer relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#2F1107] focus:ring-offset-2"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                          <Image
                            width={100}
                            height={100}
                            alt={country}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            src={imageUrl || "/placeholder.jpg"}
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm line-clamp-1">
                            {country}
                          </h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
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
