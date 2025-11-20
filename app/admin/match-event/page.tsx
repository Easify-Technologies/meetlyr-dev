"use client";

import React, { useEffect, useId, useState } from "react";
import { useFetchEvents } from "@/app/queries/get-events";
import useManualMatch from "@/app/queries/admin/manual-match";
import Loader from "@/components/ui/loader";
import Image from "next/image";
import { IoIosClose } from "react-icons/io";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const AdminEventCard = ({ event }: any) => {
  const id = useId();
  const { mutate, isPending, data, isError, isSuccess } = useManualMatch();

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [cafes, setCafes] = useState([]);
  const [groupName, setGroupName] = useState("");

  const toggleSelection = (id: string) => {
    setSelectedParticipants(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const triggerShowGroupInput = () => {
    setShowGroupInput(prev => !prev);
  }

  useEffect(() => {
    if (!event?.locationId) return;

    const handleGetCafes = async () => {
      try {
        const res = await axios.post("/api/fetch-cafes", {
          locationId: event.locationId,
        });
        setCafes(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    handleGetCafes();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm mb-4">
      <h3 className="font-semibold text-lg">{event.city}</h3>
      <p className="mb-2">{new Date(event.date).toLocaleString()}</p>

      <div className="">
        <Label htmlFor={id} className="text-base text-neutral-700 font-semibold">{event?.participants?.length} Participant(s)</Label>
        <div className="w-full flex md:flex-row flex-col md:items-center items-start gap-3 mt-2.5">
          <Popover>
            <PopoverTrigger asChild>
              <div
                id={id}
                className="h-auto w-56 px-2 py-3 focus:py-7 text-left border rounded-md cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {selectedParticipants.length > 0
                    ? `${selectedParticipants.length} selected`
                    : "Select Participant(s)"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-80 max-h-72 overflow-auto p-0">
              <Command>
                <CommandInput placeholder="Search participants..." />
                <CommandEmpty>No participant found.</CommandEmpty>

                <CommandGroup>
                  {event.participants.map((item: any) => {
                    const id = item.id;
                    const name = item?.user?.name || "Anonymous User";
                    const profileImage = item?.user?.avatar || "/diversity.png";
                    const oneLiner = item?.user?.oneLiner || "";

                    const isSelected = selectedParticipants.includes(id);

                    return (
                      <CommandItem
                        key={id}
                        value={id}
                        onSelect={() => toggleSelection(id)}
                        className="flex items-center gap-2 py-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(id)}
                          className="mr-2"
                        />

                        <Image
                          className="rounded-full w-10 h-10 object-cover"
                          src={profileImage}
                          alt={name}
                          width={40}
                          height={40}
                        />

                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">{oneLiner}</p>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <select name="cafes" id="cafes" className="h-12 px-1 border rounded-md bg-white text-[#2F1107] font-medium text-base w-56 outline-0" >
            <option value="">Select Cafe</option>
            {cafes.map((ca: any) => (
              <option key={ca.id} value={ca.id}>{ca.name}</option>
            ))}
          </select>
          {showGroupInput && (
            <div className="bg-muted flex items-center justify-between px-4 py-3 outline-none border-0 rounded-full h-12">
              <input type="text" className="text-[#2F1107] font-medium text-base w-[inherit] outline-0" placeholder="Group Name" name="group_name" id="group_name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              <IoIosClose className="cursor-pointer" size={20} onClick={triggerShowGroupInput} />
            </div>
          )}
          <button type="button" onClick={triggerShowGroupInput} className="bg-[#2f1107] text-[#ffd100] rounded-md py-3 px-4 cursor-pointer transition-colors duration-300 hover:bg-[#ffd100] font-semibold hover:text-[#2f1107]">Create Group</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {event?.participants.map((p) => {
          const name = p?.user?.name || "Anonymous User";
          const profileImage = p?.user?.avatar || "/diversity.png";
          const oneLiner = p?.user?.oneLiner || "";

          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl px-5 py-6 shadow-md border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition duration-300 cursor-pointer"
            >
              {/* Top Section */}
              <div className="flex items-center gap-2">
                <Image
                  src={profileImage}
                  alt={name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover border-2 border-yellow-300 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#2f1107]">{name}</h3>
                  <p className="text-sm text-neutral-700 font-semibold">{oneLiner}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => mutate(event.id)}
        disabled={isPending || event.isClosed}
        className={`mt-5 px-4 py-2 rounded-full ${event.isClosed
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-yellow-400 hover:bg-yellow-300"
          }`}
      >
        {event.isClosed
          ? "Already Matched"
          : isPending
            ? "Matching..."
            : "Run Matching"}
      </button>

      {isSuccess && (
        <p className="text-green-600 mt-2">
          ✅ {data.message} ({data.totalGroups} groups formed)
        </p>
      )}
      {isError && <p className="text-red-500 mt-2">Matching Already Done.</p>}
    </div>
  );
};

export default function MatchEventPage() {
  const { data, isLoading, isError } = useFetchEvents();

  if (isLoading) return <Loader />;

  if (isError) return <p className="p-6 text-red-500">Failed to load events.</p>;

  const events = Array.isArray(data) ? data : data?.events || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Match Events</h1>

      {events.length === 0 && <p>No events found.</p>}

      {events.map((event: any) => (
        <AdminEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
