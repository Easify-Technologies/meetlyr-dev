import React, { useCallback, useEffect, useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditPersonalDetails } from '@/app/queries/user/personal-details';
import PhoneNumberInput from "@/components/comp-46";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FaRegEdit } from 'react-icons/fa';
import { Button } from './ui/button';
import { ChevronDownIcon } from 'lucide-react';

interface PersonalDetails {
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
}

const PersonalDetailsModal = () => {
    const [formData, setFormData] = useState<PersonalDetails>({
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
    });
    const [errorMssg, setErrorMssg] = useState<string>("");
    const [open, setOpen] = useState(false);

    const { phoneNumber, dateOfBirth, gender } = formData;
    const { mutate, isPending, isSuccess, isError, data, error, reset } = useEditPersonalDetails();

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                window.location.reload();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    useEffect(() => {
        if (isError) {
            const timer = setTimeout(() => {
                reset();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isError, reset]);

    const date = dateOfBirth ? new Date(dateOfBirth) : undefined;

    const is18OrOlder = (dob: Date) => {
        const today = new Date();
        const ageDiff = today.getFullYear() - dob.getFullYear();
        const hasHadBirthdayThisYear =
            today.getMonth() > dob.getMonth() ||
            (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

        return ageDiff > 18 || (ageDiff === 18 && hasHadBirthdayThisYear);
    };

    const handlePhoneNumber = (value: string) => {
        setFormData((prev) => ({ ...prev, phoneNumber: value }));
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        if (!is18OrOlder(selectedDate)) {
            setErrorMssg("You must be at least 18 years old.");
        } else {
            setErrorMssg("");
        }

        setFormData((prev) => ({
            ...prev,
            dateOfBirth: selectedDate.toISOString().split("T")[0],
        }));

        setOpen(false);
    };

    const handleGenderSelect = (value: string) => {
        setFormData((prev) => ({ ...prev, gender: value }));
    };

    const handleEditPersonalDetails = useCallback(() => {
        mutate(formData);
    }, [mutate, formData]);

    return (
        <>
            <Dialog>
                <DialogTrigger className='absolute top-4 right-4 text-gray-400 cursor-pointer'>
                    <FaRegEdit size={20} />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='font-semibold text-start text-2xl text-[#2f1107]'>Personal Details</DialogTitle>
                        <DialogDescription className='text-gray-500 text-start text-sm'>
                            Update your personal information to keep your profile accurate and up to date.
                        </DialogDescription>
                        <form>
                            {/* Phone Number */}
                            <div className="flex flex-col gap-1.5 mb-3">
                                <PhoneNumberInput
                                    phone={phoneNumber}
                                    onChange={handlePhoneNumber}
                                />
                            </div>

                            {/* Date of Birth */}
                            <div className="flex flex-col gap-1.5 mb-3">
                                <label htmlFor="dateOfBirth" className="font-semibold text-[#2f1107]">
                                    Date of Birth
                                </label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="dateOfBirth"
                                            className="w-full py-8 px-5 rounded-full justify-between font-medium"
                                        >
                                            {/* ✅ date is now derived from personalForm, no separate state needed */}
                                            {date ? date.toLocaleDateString() : "Select date"}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            captionLayout="dropdown"
                                            fromYear={1925}
                                            toYear={2030}
                                            onSelect={handleDateSelect}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errorMssg && (
                                    <p className="text-destructive text-sm">{errorMssg}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5 mb-3">
                                <label htmlFor="gender" className="font-semibold text-[#2f1107]">
                                    Gender
                                </label>
                                <Select value={gender} onValueChange={handleGenderSelect}>
                                    <SelectTrigger id="gender" className="w-full py-8 px-5 rounded-full">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {isError && (
                                <p data-slot="form-message" className="text-destructive text-center text-sm font-semibold">{(error as Error).message}</p>
                            )}
                            {isSuccess && data?.message && (
                                <p data-slot="form-message" className="text-green-500 text-center text-sm font-semibold">
                                    Personal Details updated successfully
                                </p>
                            )}
                            <button type="button" onClick={handleEditPersonalDetails} disabled={isPending} className='w-full cursor-pointer bg-[#507dbc] py-2 mt-2 h-9 text-sm font-semibold text-white rounded-2xl transition-colors duration-300 hover:bg-[#507dbc]/80'>
                                {isPending ? "Updating..." : "Update Details"}
                            </button>
                        </form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default PersonalDetailsModal