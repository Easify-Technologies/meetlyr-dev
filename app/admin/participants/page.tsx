"use client";

import React, { useState } from 'react';
import { useFetchAllUsers } from '@/app/queries/admin/fetch-users';
import { useFetchEvents } from '@/app/queries/get-events';
import { useAddManualParticiapnt } from '@/app/queries/admin/add-participant';
import { parseISO, format, isAfter } from "date-fns";

const page = () => {
    const [formData, setFormData] = useState({
        userId: "",
        eventId: ""
    });
    const { data: users } = useFetchAllUsers();
    const { data: events } = useFetchEvents();

    const { mutate, isPending, isError, isSuccess, data, error } = useAddManualParticiapnt();

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    return (
        <>
            <section className="w-screen md:w-full min-h-screen bg-[#FFFFF5] relative">
                <div className="w-[inherit] mx-auto py-8 px-4 md:px-8 flex flex-col justify-center md:items-start items-center">
                    <form encType='multipart/form-data' className="flex flex-col w-full gap-4 max-w-sm">
                        <h1 className="text-4xl text-[#2f1107] font-semibold md:text-5xl lg:text-6xl text-center mb-4 whitespace-nowrap">Add Participants</h1>
                        <div className="grid w-full items-center gap-3">
                            <div className="relative">
                                <select onChange={handleInputChange} value={formData.userId} className="file:text-foreground mt-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm" name="userId" id="userId">
                                    <option value="">Select User</option>
                                    {users && users.map((item: { id: string; name: string; }) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                                <select
                                    onChange={handleInputChange}
                                    value={formData.eventId}
                                    name="eventId"
                                    id="eventId"
                                    className="file:text-foreground mt-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm"
                                >
                                    <option value="">Select Event</option>

                                    {events
                                        ?.filter((item: { date: string }) =>
                                            isAfter(parseISO(item.date), new Date())
                                        )
                                        .map((item: { id: string; date: string }) => {
                                            const formattedEventDate = format(
                                                parseISO(item.date),
                                                "EEEE, MMM do h:mm a"
                                            );

                                            return (
                                                <option key={item.id} value={item.id}>
                                                    {formattedEventDate}
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>
                        </div>
                        {isError && (
                            <p data-slot="form-message" className="text-destructive font-semibold text-sm">{(error as Error).message}</p>
                        )}
                        {isSuccess && data?.message && (
                            <p data-slot="form-message" className="text-green-500 font-semibold text-sm">{data.message}</p>
                        )}
                        <div className="flex-1 flex flex-col gap-4 justify-center items-center">
                            <button onClick={() => mutate(formData)} disabled={isPending} className="inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer text-sm md:text-base font-medium transition-all bg-[#FFD100] text-[#2f1107] hover:bg-[#FFD100]/90 h-12 px-4 py-2 rounded-full w-full" type="button">
                                {isPending ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    )
}

export default page