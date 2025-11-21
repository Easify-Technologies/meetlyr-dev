"use client";

import React, { useEffect, useId, useState } from "react";
import { useFetchEvents } from "@/app/queries/get-events";
// import useManualMatch from "@/app/queries/admin/manual-match";
import { useManualGroup } from "@/app/queries/admin/manual-group";
import { useFetchManualGroups } from "@/app/queries/admin/manual-group";
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
  // const { mutate, isPending, data, isError, isSuccess } = useManualMatch();
  const { mutate: mutateGroup, isSuccess: groupSuccess, data: groupData, error, isError: groupError } = useManualGroup();
  const { data: existingGroups } = useFetchManualGroups(event.id);

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cafes, setCafes] = useState([]);
  const [formData, setFormData] = useState({
    groupName: "",
    cafes: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const toggleSelection = (id: string) => {
    setSelectedParticipants(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const triggerShowGroupInput = () => {
    setShowGroupInput(true);
  }

  const handleManualGroupCreation = () => {
    mutateGroup({
      eventId: event.id,
      groupName: formData.groupName,
      cafes: formData.cafes,
      selectedParticipants: selectedParticipants
    });
  }

  const handleSendConfirmation = async () => {
    setLoading(true);

    try {
      if (!existingGroups || existingGroups.length === 0) {
        setLoading(false);
        return;
      }

      for (const group of existingGroups) {
        const matchedMembers = group.members
          .map((participantId: string) =>
            event.participants.find((p: any) => p.id === participantId)
          )
          .filter(Boolean);

        const to = matchedMembers
          .map((member: any) => member.user?.email)
          .filter(Boolean);

        if (!to.length) continue;

        const groupNames = matchedMembers
          .map((member: any) => member.user?.name || "Guest")
          .join(", ");

        const date = event?.date || new Date().toISOString();

        const response = await fetch("/api/admin/send-meetup-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            to,
            groupNames,
            cafe: group.cafe,
            date,
          }),
        });

        const data = await response.json();
        if (response.ok || response.status === 200) {
          setMessage(data.message);
        }
        else {
          setMessage(data.error);
        }
      }

      alert("Confirmation emails sent!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to send confirmation emails");
    } finally {
      setLoading(false);
    }
  };

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
          <select name="cafes" id="cafes" onChange={handleInputChange} value={formData.cafes} className="h-12 px-1 border rounded-md bg-white text-[#2F1107] font-medium text-base w-56 outline-0" >
            <option value="">Select Cafe</option>
            {cafes.map((ca: any) => (
              <option key={ca.id} value={ca.id}>{ca.name}</option>
            ))}
          </select>
          {showGroupInput && (
            <div className="bg-muted flex items-center justify-between px-4 py-3 outline-none border-0 rounded-full h-12">
              <input type="text" className="text-[#2F1107] font-medium text-base w-[inherit] outline-0" placeholder="Group Name" name="groupName" value={formData.groupName} onChange={handleInputChange} />
              <IoIosClose className="cursor-pointer" size={20} onClick={() => setShowGroupInput(false)} />
            </div>
          )}
          {event?.status === "Matched" ? (
            <button disabled type="button" className="bg-muted-foreground rounded-md py-3 px-4 text-gray-800 font-semibold cursor-not-allowed">
              Groups Created
            </button>
          ) : (
            <button
              type="button"
              onClick={
                () => {
                  if (!showGroupInput) {
                    triggerShowGroupInput();
                  } else {
                    handleManualGroupCreation();
                  }
                }}
              disabled={groupSuccess}
              className="bg-[#2f1107] text-[#ffd100] rounded-md py-3 px-4 cursor-pointer transition-colors duration-300 hover:bg-[#ffd100] font-semibold hover:text-[#2f1107]">
              {groupSuccess ? "Creating..." : "Create Group"}
            </button>
          )}
        </div>
      </div>

      {
        groupError && (
          <p data-slot="form-message" className="text-red-500 mt-2.5 font-semibold text-sm">{(error as Error).message}</p>
        )
      }
      {
        groupSuccess && groupData?.message && (
          <p data-slot="form-message" className="text-green-500 mt-2.5 font-semibold text-sm">{groupData.message}</p>
        )
      }

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {existingGroups && existingGroups.length > 0 ? (
          <div className="bg-white rounded-3xl p-4 shadow-md border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition duration-300 cursor-pointer">
            {existingGroups.map((group: any) => {
              const matchedMembers = group.members
                .map((participantId: string) =>
                  event.participants.find((p: any) => p.id === participantId)
                )
                .filter(Boolean);

              return (
                <div key={group.id} className="p-4 rounded-xl mb-4">
                  <h4 className="text-xl font-semibold text-[#2f1107] mb-2">{group.groupName}</h4>
                  <p className="text-base font-semibold text-neutral-600 mb-1">
                    Cafe Name: {group.cafe.name}
                  </p>
                  <p className="text-base font-semibold text-neutral-600 mb-1">
                    Cafe Address: {group.cafe.address}
                  </p>
                  <p className="text-base font-semibold text-[#2f1107] mb-3">
                    Total Members: {group.members.length}
                  </p>

                  <div className="space-y-3">
                    {matchedMembers.map((member: any) => {
                      const name = member.user?.name || "Anonymous User";
                      const profileImage = member.user?.avatar || "/diversity.png";
                      const oneLiner = member.user?.oneLiner || "";

                      return (
                        <div key={member.id} className="flex items-center gap-3">
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-neutral-600 font-semibold text-base col-span-full">No groups created yet.</p>
        )}
      </div>

      {
        existingGroups && existingGroups.length > 0 && (
          event?.status !== "Matched" ? (
            <button
              onClick={handleSendConfirmation}
              disabled={loading}
              type="button"
              className="bg-[#2f1107] text-[#ffd100] mt-4 rounded-md p-3 cursor-pointer transition-colors duration-300 hover:bg-[#ffd100] font-semibold hover:text-[#2f1107]"
            >
              {loading ? "Sending..." : "Send Confirmation"}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="bg-neutral-300 text-neutral-600 mt-4 rounded-md p-3 cursor-not-allowed font-semibold"
            >
              Confirmed
            </button>
          )
        )
      }

      {
        message && (
          <p className="text-neutral-700 font-semibold mt-2.5 text-base">{message}</p>
        )
      }

      {/* <button
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
        <p className="text-green-600 font-semibold mt-2">
          ✅ {data.message} ({data.totalGroups} groups formed)
        </p>
      )}
      {isError && <p className="text-red-500 font-semibold mt-2">Matching Already Done.</p>} */}
    </div >
  );
};

export default function MatchEventPage() {
  const { data, isLoading, isError } = useFetchEvents();

  if (isLoading) return <Loader />;

  if (isError) return <p className="p-6 text-red-500 text-base font-semibold">Failed to load events.</p>;

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
