"use client";

import React, { useState, useCallback } from 'react';

import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { useAddPromoCode } from '@/app/queries/admin/add-promo-code';

interface PromoCode {
    code: string;
    discount: number;
    expiresAt: Date;
}

const page = () => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const { mutate, isSuccess, isPending, data, error, isError } = useAddPromoCode();
    const [formData, setFormData] = useState<PromoCode>({
        code: "",
        discount: 0,
        expiresAt: new Date()
    });
    const { code, discount } = formData;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "discount" ? Number(value) : value
        }));
    }

    const handleSubmitPromoCode = useCallback(() => {
        mutate(formData);
    }, [formData]);

    return (
        <>
            <section className="md:w-full w-screen min-h-screen bg-[#FFFFF5] relative">
                <div className="w-full mx-auto py-8 px-4 md:px-8 flex flex-col justify-center md:items-start items-center">
                    <form className="flex flex-col w-full gap-4 max-w-sm">
                        <h1 className="w-full text-4xl text-[#2f1107] font-semibold md:text-5xl lg:text-6xl text-center mb-4 whitespace-nowrap">
                            Add Promo Code
                        </h1>
                        <div className="grid w-full items-center gap-3.5">
                            <input
                                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input uppercase flex h-16 w-full rounded-full border bg-muted px-5 py-2"
                                type="text"
                                name="code"
                                placeholder="Enter Promo Code"
                                value={code}
                                onChange={handleInputChange}
                            />
                            <input
                                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full rounded-full border bg-muted px-5 py-2"
                                type="tel"
                                name="discount"
                                placeholder="Enter Discount Percentage"
                                value={discount}
                                onChange={handleInputChange}
                            />
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date"
                                        className="file:text-foreground mb-5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm justify-between"
                                    >
                                        {date ? date.toLocaleDateString() : "Select Expiry Date"}
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
                                                expiresAt: newDate ?? new Date(),
                                            }));
                                            setOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        {isError && (
                            <p className="text-destructive text-sm mt-2">
                                {(error as Error).message}
                            </p>
                        )}
                        {isSuccess && data?.message && (
                            <p className="text-green-500 text-sm mt-2">{data.message}</p>
                        )}
                        <div className="flex-1 flex flex-col gap-4 justify-center items-center">
                            <button
                                type="button"
                                onClick={handleSubmitPromoCode}
                                disabled={isPending}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer text-sm md:text-base font-medium transition-colors duration-300 bg-[#FFD100] text-[#2f1107] hover:bg-[#FFD100]/70 h-12 px-4 py-2 rounded-full w-full"
                            >
                                {isPending ? "Adding..." : "Add Promo Code"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    )
}

export default page