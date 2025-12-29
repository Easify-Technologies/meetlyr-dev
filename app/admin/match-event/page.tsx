"use client";

import React, { useEffect, useId, useState } from "react";
import { useFetchEvents } from "@/app/queries/get-events";
// import useManualMatch from "@/app/queries/admin/manual-match";
import { useManualGroup } from "@/app/queries/admin/manual-group";
import { useFetchManualGroups } from "@/app/queries/admin/manual-group";
import Loader from "@/components/ui/loader";
import Image from "next/image";
import { IoIosClose } from "react-icons/io";
import { FaUserEdit } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"
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
import toast from "react-hot-toast";
import { useFetchAllLocations } from "@/app/queries/fetch-locations";

const AdminEventCard = ({ event }: any) => {
  const id = useId();
  // const { mutate, isPending, data, isError, isSuccess } = useManualMatch();
  const { mutate: mutateGroup, isSuccess: groupSuccess, data: groupData, error, isError: groupError } = useManualGroup();
  const { data: existingGroups } = useFetchManualGroups(event.id);

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCafe, setSelectedCafe] = useState("");
  const [cafes, setCafes] = useState([]);
  const [editGroup, setEditGroup] = useState<any>(null);
  const [isGroupEdited, SetIsGroupEdited] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
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

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id)
        ? prev.filter(m => m !== id)
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

        const res = await axios.post("/api/admin/send-meetup-email", {
          eventId: event.id,
          to,
          groupNames,
          cafe: group.cafe,
          date,
        });

        if (res.data.message === "Emails sent successfully!") {
          setMessage(res.data.message);
          if (isGroupEdited) {
            toast.success("Confirmation Email Sent Successfully");
          }
        }
        else {
          setMessage(res.data.error);
        }
        return res.data;
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

  const handleSaveGroup = async () => {
    if (selectedMembers.length < 2) {
      toast.error("A group must have at least 2 members.");
      return;
    }

    try {
      const res = await axios.post("/api/admin/edit-group", {
        groupId: editGroup.id,
        members: selectedMembers,
        cafe: selectedCafe,
        eventId: event?.id
      });
      if (res.data.message === "Group Updated Successfully") {
        SetIsGroupEdited(true);
        toast.success("Group Members Updated");
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
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
                <div key={group.id} className="p-4 relative rounded-xl mb-4">
                  <h4 className="text-xl font-semibold text-[#2f1107] mb-2">{group.groupName}</h4>
                  <Dialog>
                    <DialogTrigger
                      onClick={() => {
                        setEditGroup(group);
                        setSelectedMembers(group.members);
                        setSelectedCafe(group.cafeId);
                      }}
                      className="absolute top-2 right-1 rounded-md p-2 flex items-center justify-center cursor-pointer hover:bg-[#ffd100] hover:text-[#2f1107] transition-colors duration-300"
                    >
                      <FaUserEdit size={20} />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Group Members</DialogTitle>
                        <DialogDescription>
                          Add or remove members from <strong>{editGroup?.groupName}</strong>
                        </DialogDescription>
                      </DialogHeader>

                      <select
                        name="selectedCafe"
                        value={selectedCafe}
                        onChange={(e) => setSelectedCafe(e.target.value)}
                        className="w-full bg-muted px-2 border border-input py-2 rounded-md text-sm font-semibold outline-input"
                      >
                        <option value="">Select Cafe</option>
                        {cafes.map((ca: any) => (
                          <option key={ca.id} value={ca.id}>{ca.name}</option>
                        ))}
                      </select>

                      <div className="max-h-[300px] overflow-y-auto space-y-3 mt-4">
                        {event.participants.map((participant: any) => {
                          const checked = selectedMembers.includes(participant.id);

                          return (
                            <div
                              key={participant.id}
                              className="flex items-center gap-3 cursor-pointer"
                              onClick={() => toggleMember(participant.id)}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleMember(participant.id)}
                              />

                              <Image
                                src={participant.user?.avatar || "/diversity.png"}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover rounded-full"
                                alt={participant.user?.name}
                              />

                              <div>
                                <p className="font-medium">
                                  {participant.user?.name || "Anonymous User"}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {participant.user?.oneLiner || ""}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={isGroupEdited ? handleSendConfirmation : handleSaveGroup}
                        disabled={loading}
                        className="mt-4 bg-[#2f1107] py-2 cursor-pointer rounded-md transition-colors duration-300 text-[#ffd100] text-sm font-semibold hover:bg-[#ffd100] hover:text-[#2f1107]"
                      >
                        {isGroupEdited ? "Send Confirmation" : "Save Changes"}
                      </button>
                    </DialogContent>
                  </Dialog>
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
  const { data: locations } = useFetchAllLocations();

  const [searchTerm, setSearchTerm] = useState({
    city: "",
    pastEvents: false
  });

  const { city, pastEvents } = searchTerm;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchTerm({ ...searchTerm, [name]: value });
  }

  const handlePastEventToggle = (checked: boolean) => {
    setSearchTerm((prev) => ({
      ...prev,
      pastEvents: checked
    }));
  };

  const events = Array.isArray(data) ? data : data?.events || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    const isPastEvent = eventDate < today;
    const isFutureEvent = eventDate >= today;

    const isCityMatch = city
      ? event.city?.toLowerCase().includes(city.toLowerCase())
      : true;

    const isDateMatch = pastEvents ? isPastEvent : isFutureEvent;

    return isCityMatch && isDateMatch;
  });

  if (isLoading) return <Loader />

  if (isError) return <p className="p-6 text-red-500 text-base font-semibold">Failed to load events.</p>

  return (
    <div className="py-8 px-6">
      <div className="flex items-center justify-between md:gap-10 gap-0 md:flex-row flex-col mb-7">
        <h1 className="text-2xl font-bold md:mb-0 mb-4">Admin - Match Events</h1>
        <div className="flex items-center justify-center gap-4 md:flex-row flex-col">
          <select onChange={handleInputChange} value={city} name="city" id="city" className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-12 w-52 min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm">
            <option value="">Select City</option>
            {locations && locations.map((loc: any) => (
              <option key={loc.id} value={loc.city}>{loc.city}</option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <Switch
              id="pastEvents"
              checked={pastEvents}
              onCheckedChange={handlePastEventToggle}
            />
            <Label htmlFor="pastEvents" className="text-[#2f1107] text-base font-medium">Past Events</Label>
          </div>
        </div>
      </div>

      {events.length === 0 && <p>No events found.</p>}

      {filteredEvents.map((event: any) => (
        <AdminEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
