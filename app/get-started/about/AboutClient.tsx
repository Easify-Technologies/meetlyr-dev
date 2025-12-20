'use client';

import React, { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import OneLinerDropdown from "@/components/comp-234";
import Link from "next/link";
import toast from "react-hot-toast";

const AboutClient = () => {
    const router = useRouter();

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        gender: "",
        dateOfBirth: "",
        oneLiner: ""
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ✅ Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            toast.error("Image must be smaller than 5MB");
            return;
        }

        setAvatarFile(file);
    };

    const is18OrOlder = (dob: Date) => {
        const today = new Date();
        const ageDiff = today.getFullYear() - dob.getFullYear();
        const hasHadBirthdayThisYear =
            today.getMonth() > dob.getMonth() ||
            (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

        return ageDiff > 18 || (ageDiff === 18 && hasHadBirthdayThisYear);
    };

    const handleNext = async () => {
        if (
            !formData.gender ||
            !date ||
            !formData.oneLiner ||
            !is18OrOlder(date) ||
            !avatarFile
        ) {
            return;
        }

        setLoading(true);

        const params = new URLSearchParams(window.location.search);
        params.set("gender", formData.gender);
        params.set("dateOfBirth", date.toISOString().split("T")[0]);
        params.set("oneLiner", formData.oneLiner);

        let avatarPath = "";
        const formDataFile = new FormData();

        try {
            // ✅ Compress image before upload
            const options = {
                maxSizeMB: 1, // Max file size in MB
                maxWidthOrHeight: 1024, // Max dimension
                useWebWorker: true
            };

            const compressedFile = await imageCompression(avatarFile, options);
            formDataFile.append("avatar", compressedFile);

            const res = await fetch("/api/upload/avatar", {
                method: "POST",
                body: formDataFile,
            });

            const data = await res.json();

            if (!res.ok || !data?.url) {
                console.error("Avatar upload failed:", data?.error);
                toast.error("Failed to upload avatar. Please try again.");
                return;
            }

            avatarPath = data.url;
        } catch (err) {
            console.error("Error uploading avatar:", err);
            toast.error("File too large. Maximum size is 5MB");
            return;
        }
        finally {
            setLoading(false);
        }

        params.set("avatar", avatarPath);
        router.push(`/get-started/matching?${params.toString()}`);
    };

    const handleBack = () => {
        const params = new URLSearchParams(window.location.search);
        router.push(`/get-started/questions?${params.toString()}`);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const gender = params.get("gender");
        const dateOfBirth = params.get("dateOfBirth");
        const oneLiner = params.get("oneLiner");

        setFormData(prev => ({
            ...prev,
            gender: gender ?? prev.gender,
            dateOfBirth: dateOfBirth ?? prev.dateOfBirth,
            oneLiner: oneLiner ?? prev.oneLiner
        }));

        if (dateOfBirth) {
            setDate(new Date(dateOfBirth));
        }
    }, []);

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
                    <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto h-full">
                        <div className="h-full flex flex-col p-4">
                            <div className="flex items-center justify-between gap-2 px-4 pb-5 w-full">
                                <Link href="/">
                                    <Image
                                        src="/Mocha-e1760632297719.webp"
                                        alt="Meetly"
                                        width={100}
                                        height={100}
                                        quality={100}
                                        priority
                                    />
                                </Link>
                            </div>
                            <div className="flex-1 min-h-0 overflow-y-auto">
                                <div className="h-full flex flex-col">
                                    <form encType="multipart/form-data" className="flex-1 overflow-y-auto flex flex-col gap-6 text-center px-4 pt-10 pb-4">
                                        <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">What gender are you?</h1>
                                        <RadioGroup
                                            className="flex gap-2 items-center justify-center w-full mx-auto py-3"
                                            value={formData.gender}
                                            onValueChange={(value) => setFormData((p) => ({ ...p, gender: value }))}
                                        >
                                            <Label
                                                htmlFor="male"
                                                className="relative w-1/2 flex cursor-pointer flex-col items-center gap-3 rounded-full border border-input px-2 py-5 text-center shadow-xs transition-all
                                                data-[state=checked]:bg-blue-100
                                                data-[state=checked]:border-blue-500
                                                focus-within:ring-2
                                                focus-within:ring-blue-300"
                                            >
                                                <RadioGroupItem
                                                    value="male"
                                                    id="male"
                                                    className="sr-only peer"
                                                />
                                                <span className="text-sm leading-none font-bold text-foreground peer-data-[state=checked]:text-blue-700">
                                                    Male
                                                </span>
                                            </Label>

                                            <Label
                                                htmlFor="female"
                                                className="relative w-1/2 flex cursor-pointer flex-col items-center gap-3 rounded-full border border-input px-2 py-5 text-center shadow-xs transition-all
                                                data-[state=checked]:bg-pink-100
                                                data-[state=checked]:border-pink-500
                                                focus-within:ring-2
                                                focus-within:ring-pink-300"
                                            >
                                                <RadioGroupItem
                                                    value="female"
                                                    id="female"
                                                    className="sr-only peer"
                                                />
                                                <span className="text-sm leading-none font-bold text-foreground peer-data-[state=checked]:text-pink-700">
                                                    Female
                                                </span>
                                            </Label>

                                            <Label
                                                htmlFor="other"
                                                className="relative w-1/2 flex cursor-pointer flex-col items-center gap-3 rounded-full border border-input px-2 py-5 text-center shadow-xs transition-all
                                                data-[state=checked]:bg-yellow-100
                                                data-[state=checked]:border-yellow-500
                                                focus-within:ring-2
                                                focus-within:ring-yellow-300"
                                            >
                                                <RadioGroupItem
                                                    value="other"
                                                    id="other"
                                                    className="sr-only peer"
                                                />
                                                <span className="text-sm leading-none font-bold text-foreground peer-data-[state=checked]:text-yellow-700">
                                                    Other
                                                </span>
                                            </Label>
                                        </RadioGroup>

                                        <div className='py-6 border-t border-[#f7f0f2]'>
                                            <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">What is your date of birth?</h1>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        id="date"
                                                        className="w-full py-8 px-5 rounded-full justify-between font-medium mt-10"
                                                    >
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
                                                        onSelect={(selectedDate) => {
                                                            if (selectedDate) {
                                                                // Always display the date
                                                                setDate(selectedDate);

                                                                // Validate age
                                                                if (!is18OrOlder(selectedDate)) {
                                                                    setError("You must be at least 18 years old.");
                                                                } else {
                                                                    setError("");
                                                                }

                                                                // Store in form data regardless
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    dateOfBirth: selectedDate.toISOString().split("T")[0],
                                                                }));
                                                            }
                                                            setOpen(false);
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="py-6 border-t border-[#f7f0f2]">
                                            <OneLinerDropdown setFormData={setFormData} />
                                        </div>
                                        <div className="py-6 border-t border-[#f7f0f2]">
                                            <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">Upload Your Image</h1>
                                            <input
                                                type="file"
                                                name="imageUrl"
                                                id="imageUrl"
                                                accept=".jpg, .jpeg, .png, .webp, .gif"
                                                onChange={handleFileChange}
                                                className="mt-4 w-full rounded-full border border-gray-300 bg-gray-100 px-5 py-3 text-base text-gray-700
                                                transition-colors duration-200 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[#2f1107] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white
                                                file:hover:bg-[#2f1107]/90
                                                placeholder:text-gray-400
                                                focus:border-[#2f1107] focus:ring-1"
                                            />
                                        </div>
                                    </form>
                                    {error && <p className="text-red-500 text-base font-semibold">{error}</p>}
                                    <div className="p-4 bg-background flex items-center justify-center gap-4">
                                        <button className="bg-[#ffd100] cursor-pointer h-12 px-4 py-2 rounded-full w-full text-sm md:text-base font-medium transition-all duration-500 hover:bg-[#2f1107] hover:text-white" onClick={handleBack} type="button">
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={!formData.gender || !date || loading}
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all select-none bg-[#FFD100] text-[#2F1107] hover:bg-[#2F1107] hover:text-[#ffd100] h-12 px-4 py-2 rounded-full w-full duration-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {loading ? "Processing..." : "Next"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
        </>
    )
}

export default AboutClient