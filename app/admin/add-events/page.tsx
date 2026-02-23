"use client";

import React, { useState } from "react";

import { useFetchAllCafes } from "@/app/queries/fetch-cafes";
import { useAddEvents } from "@/app/queries/admin/add-events";
import { useFetchAllLocations } from "@/app/queries/fetch-locations";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Loader from "@/components/ui/loader";

interface EventsProps {
  date: string;
  country: string;
  time: string;
  city: string;
  locationId: string;
  tagline: string;
}

const Page = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<EventsProps>({
    date: "",
    city: "",
    time: "",
    country: "",
    locationId: "",
    tagline: ""
  });

  const { data: cafes, isFetching } = useFetchAllCafes();
  const { mutate, isPending, isSuccess, isError, data, error } = useAddEvents();
  const { data: locations } = useFetchAllLocations();

  const filteredCities =
    locations &&
    locations
      .filter((loc: { country: string }) => loc.country === formData.country)
      .map((loc: { city: string }) => loc.city);

  const filteredCafes =
    cafes?.filter(
      (c: { location?: { city?: string } }) =>
        c.location?.city === formData.city
    ) || [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "country" ? { city: "", cafeId: "" } : {}),
      ...(name === "city" ? { cafeId: "" } : {}),
    }));
  };

  const generateTimeSlots = (intervalMinutes = 15) => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        const hourStr = h.toString().padStart(2, "0");
        const minStr = m.toString().padStart(2, "0");
        slots.push({
          value: `${hourStr}:${minStr}`,
          label: `${hourStr}:${minStr}`,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(60);

  const handleSaveEvent = () => {
    const fullDateTime = new Date(`${formData.date}T${formData.time}:00`);

    mutate({
      date: fullDateTime.toISOString(),
      country: formData.country,
      city: formData.city,
      locationId: formData.locationId,
      tagline: formData.tagline
    });
  };

  if (isFetching) return <Loader />;

  return (
    <>
      <section className="md:w-full w-screen min-h-screen bg-[#FFFFF5] relative">
        <div className="w-full mx-auto py-8 px-4 md:px-8 flex flex-col justify-center md:items-start items-center">
          <form
            encType="multipart/form-data"
            className="flex flex-col w-full gap-4 max-w-sm"
          >
            <h1 className="text-4xl text-[#2f1107] font-semibold md:text-5xl lg:text-6xl text-center mb-4">
              Add Events
            </h1>
            <div className="grid w-full items-center gap-3">
              <div className="relative">
                <select
                  className="file:text-foreground mb-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm"
                  name="country"
                  id="country"
                  onChange={handleInputChange}
                  value={formData.country}
                >
                  <option value="">Select Country</option>
                  {locations &&
                    [
                      ...new Set(
                        locations.map(
                          (location: { country: string }) => location.country
                        )
                      ),
                    ].map((country, idx) => (
                      <option key={idx} value={country}>
                        {country}
                      </option>
                    ))}
                </select>
                <select
                  className="file:text-foreground mb-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm"
                  name="city"
                  id="city"
                  onChange={handleInputChange}
                  value={formData.city}
                  disabled={!formData.country}
                >
                  <option value="">Select City</option>
                  {filteredCities?.map((city: string, idx: number) => (
                    <option key={idx} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="file:text-foreground mb-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm justify-between"
                    >
                      {date ? date.toLocaleDateString() : "Select Date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      onSelect={(newDate) => {
                        setDate(newDate);
                        setFormData((prev) => ({
                          ...prev,
                          date: newDate
                            ? newDate.toISOString().split("T")[0]
                            : "",
                        }));
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <select
                  name="time"
                  id="time"
                  onChange={handleInputChange}
                  value={formData.time}
                  disabled={!date}
                  className="file:text-foreground mb-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none"
                >
                  <option value="">Select Time</option>

                  {timeSlots.map((slot, idx) => (
                    <option key={idx} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <select
                  name="locationId"
                  id="cafe"
                  onChange={handleInputChange}
                  value={formData.locationId || ""}
                  disabled={!formData.city}
                  className="file:text-foreground mb-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full rounded-full border bg-muted px-5 py-2"
                >
                  <option value="">Select Café</option>

                  {filteredCafes.map((cafe: any) => (
                    <option key={cafe.id} value={cafe.locationId}>
                      {cafe.name}
                    </option>
                  ))}
                </select>
                <input
                  className="file:text-foreground mb-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full rounded-full border bg-muted px-5 py-2"
                  type="text" 
                  name="tagline"
                  onChange={handleInputChange}
                  value={formData.tagline || ""}
                  placeholder="Write a Tagline..."
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
            </div>
            <div className="flex-1 flex flex-col gap-4 justify-center items-center">
              <button
                onClick={handleSaveEvent}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer text-sm md:text-base font-medium transition-all bg-[#FFD100] text-[#2f1107] hover:bg-[#FFD100]/90 h-12 px-4 py-2 rounded-full w-full"
                type="button"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Page;
