import { useCallback, useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { FaRegEdit } from 'react-icons/fa';
import { useAboutMeFunction } from "@/app/queries/user/about-me";

type AboutMeData = {
    connectionStyle: string;
    communicationStyle: string;
    socialStyle: string;
    healthFitnessStyle: string;
    family: string;
    spirituality: string;
    politicsNews: string;
    humor: string;
    peopleType: string[]
}

const AboutMeModal = () => {
    const [step, setStep] = useState<number>(1);
    const [selectedStyle, setSelectedStyle] = useState<string>("");
    const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
    const [sliderValue, setSliderValue] = useState<number[]>([0]);
    const [formData, setFormData] = useState<AboutMeData>({
        connectionStyle: "",
        communicationStyle: "",
        socialStyle: "",
        healthFitnessStyle: "",
        family: "",
        spirituality: "",
        politicsNews: "",
        humor: "",
        peopleType: []
    });

    const { mutate, isPending, isError, isSuccess, data, error, reset } = useAboutMeFunction();

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

    const connectionStyles = [
        { label: "I ask questions", value: "ask_questions" },
        { label: "I share stories", value: "share_stories" },
        { label: "I listen", value: "listen" }
    ];

    const communicationStyles = [
        { label: "Talking about life", value: "talking_about_life" },
        { label: "Exploring ideas", value: "exploring_ideas" },
        { label: "Asking big questions", value: "asking_big_questions" },
        { label: "Finding common ground", value: "finding_common_ground" }
    ];

    const socialStyles = [
        { label: "Nature", value: "nature" },
        { label: "The City", value: "the_city" },
        { label: "At Home", value: "at_home" }
    ];

    const healthFitnessStyles = [
        { label: "It's a big part of my lifestyle", value: "big_part_of_lifestyle" },
        { label: "I care, but I keep it balanced", value: "balanced" },
        { label: "Not a major focus right now", value: "not_major_focus" }
    ];

    const stepHeadings: { [key: number]: string } = {
        1: "How do you usually connect with people?",
        2: "What makes a conversation meaningful to you?",
        3: "I prefer spending more time in?",
        4: "How much does health and fitness matter to you?",
        5: "How important is family to you?",
        6: "How important is spirituality to you?",
        7: "Do you enjoy discussing politics/news?",
        8: "Do you enjoy politically incorrect humor?",
        9: "What kind of people do you like to meet?"
    };

    const stepConfig: {
        [key: number]: {
            key: string;
            type: "radio" | "slider" | "multi";
            options?: { label: string; value: string }[];
        };
    } = {
        1: { key: "connectionStyle", type: "radio", options: connectionStyles },
        2: { key: "communicationStyle", type: "radio", options: communicationStyles },
        3: { key: "socialStyle", type: "radio", options: socialStyles },
        4: { key: "healthFitnessStyle", type: "radio", options: healthFitnessStyles },
        5: { key: "family", type: "slider" },
        6: { key: "spirituality", type: "slider" },
        7: { key: "politicsNews", type: "slider" },
        8: { key: "humor", type: "slider" },
        9: {
            key: "peopleType",
            type: "multi",
            options: [
                { label: "Creative Souls", value: "Creative Souls" },
                { label: "Builders & Founders", value: "Builders & Founders" },
                { label: "Active Lifestyles", value: "Active Lifestyles" },
                { label: "Family Life", value: "Family Life" },
                { label: "Life After Work", value: "Life After Work" },
                { label: "Thoughtful Minds", value: "Thoughtful Minds" },
                { label: "Explorers", value: "Explorers" },
                { label: "Everyone Welcome", value: "Everyone Welcome" },
            ]
        }
    };

    const currentConfig = stepConfig[step];
    const options = currentConfig.options;

    const handleBackButton = () => {
        if (step > 1) {
            setStep(step - 1);

            setSelectedStyle("");
            setSelectedMulti([]);
            setSliderValue([0]);
        }
    };

    const isDisabled = (() => {
        if (currentConfig.type === "radio") return !selectedStyle;
        if (currentConfig.type === "slider") return sliderValue[0] === 0;
        if (currentConfig.type === "multi") return !(selectedMulti && selectedMulti.length > 0);
        return true;
    })();

    const goNextWithValue = (valueToSave: string | string[]) => {
        const { key } = currentConfig;

        const updatedForm = { ...formData, [key]: valueToSave };
        setFormData(updatedForm);

        if (step < 9) {
            setStep((s) => s + 1);
            setSelectedStyle("");
            setSelectedMulti([]);
            setSliderValue([0]);
        } else {
            console.log("✅ Final Form Data:", updatedForm);
        }
    };

    const toggleMulti = (val: string) => {
        setSelectedMulti((prev) => {
            const exists = prev.includes(val);
            if (exists) return prev.filter((p) => p !== val);
            if (prev.length >= 3) return prev;
            return [...prev, val];
        });
    };

    const getSliderLabel = (value: number) => {
        if (value <= 2) return "Strongly Disagree";
        if (value <= 4) return "Disagree";
        if (value <= 6) return "Neutral";
        if (value <= 8) return "Agree";
        return "Strongly Agree";
    };

    const handleUpdateAboutMe = useCallback(() => {
        if (step === 9) {
            const updatedForm = { ...formData, peopleType: selectedMulti };
            mutate(updatedForm);
            return;
        }

        mutate(formData);
    }, [mutate, formData, selectedMulti, step]);

    return (
        <>
            <Dialog>
                <DialogTrigger className='absolute top-4 right-4 text-gray-400 cursor-pointer'>
                    <FaRegEdit size={20} />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Your Additional Information</DialogTitle>
                        <DialogDescription>
                            Keep your profile up to date by adding or editing your personal information. These details help us personalize your experience and ensure accurate bookings, communication, and account management.
                        </DialogDescription>
                        <h4 className="text-xl text-center md:text-2xl lg:text-3xl text-[#2F1107] font-semibold mt-2">{stepHeadings[step]}</h4>
                        <div className="flex gap-2 items-center justify-center w-full mx-auto py-2">
                            {[...Array(9)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-8 h-1 rounded-full ${i < step ? "bg-[#2F1107]" : "bg-muted"
                                        }`}
                                />
                            ))}
                        </div>
                        <div className='space-y-3'>
                            {currentConfig.type === "radio" && (
                                <RadioGroup
                                    className="w-full gap-7"
                                    value={selectedStyle}
                                    onValueChange={(value) => {
                                        setSelectedStyle(value);
                                        goNextWithValue(value);
                                    }}
                                >
                                    {options?.map((style, index) => (
                                        <Label
                                            key={index}
                                            htmlFor={style.value}
                                            className={`flex items-center justify-between border rounded-xl px-4 py-3 cursor-pointer transition-all
                                                        ${selectedStyle === style.value
                                                    ? "border-[#2F1107] bg-[#2F1107]/10"
                                                    : "border-[#2F1107]/40 hover:bg-[#2F1107]/5"
                                                }`}
                                        >
                                            <div className="text-sm font-medium text-[#2F1107]">{style.label}</div>
                                            <RadioGroupItem
                                                value={style.value}
                                                id={style.value}
                                                className="border-[#2F1107]
                                                        text-[#2F1107]
                                                        data-[state=checked]:bg-[#2F1107]
                                                        data-[state=checked]:border-[#2F1107]
                                                        data-[state=checked]:text-[#2F1107]"
                                            />
                                        </Label>
                                    ))}
                                </RadioGroup>
                            )}

                            {currentConfig.type === "slider" && (
                                <div className="grid grid-cols-5 gap-4 w-full mx-auto max-w-md">
                                    {Array.from({ length: 10 }).map((_, i) => {
                                        const value = i + 1;
                                        const isSelected = sliderValue[0] === value;

                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => {
                                                    setSliderValue([value]);
                                                    goNextWithValue(String(value));
                                                }}
                                                className={`h-16 rounded-xl border transition-all
                                                          flex flex-col items-center justify-center text-center
                                                          ${isSelected
                                                        ? "border-[#2F1107] bg-[#2F1107]/10 text-[#2F1107]"
                                                        : "border-[#2F1107]/40 hover:bg-[#2F1107]/5"
                                                    }`}
                                            >
                                                {/* Number */}
                                                <span className="text-sm font-semibold leading-tight">
                                                    {value}
                                                </span>

                                                {/* Meaning */}
                                                <span
                                                    className={`text-[10px] mt-1 leading-tight ${isSelected ? "text-[#2F1107] font-medium" : "text-muted-foreground"
                                                        }`}
                                                >
                                                    {getSliderLabel(value)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {currentConfig.type === "multi" && (
                                <div className="flex flex-col gap-3">
                                    {currentConfig.options?.map((option) => {
                                        const checked = selectedMulti.includes(option.value);
                                        return (
                                            <label
                                                key={option.value}
                                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${checked ? "bg-[#FFD100] text-[#2F1107]" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={option.value}
                                                    checked={checked}
                                                    onChange={() => toggleMulti(option.value)}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        );
                                    })}
                                    <p className="text-xs text-muted-foreground">You can select up to 3</p>
                                </div>
                            )}
                        </div>
                        {isError && (
                            <p data-slot="form-message" className="text-destructive text-center text-sm font-semibold">{(error as Error).message}</p>
                        )}
                        {isSuccess && data?.message && (
                            <p data-slot="form-message" className="text-green-500 text-center text-sm font-semibold">
                                Personal Details updated successfully
                            </p>
                        )}
                        <div className="p-4 bg-background flex items-center justify-center gap-4">
                            <button disabled={isDisabled} className="bg-[#ffd100] cursor-pointer h-12 px-4 py-2 rounded-full w-full text-sm md:text-base font-medium transition-all duration-500 hover:bg-[#2f1107] hover:text-white" onClick={handleBackButton} type="button">
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateAboutMe}
                                disabled={isDisabled}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all select-none bg-[#FFD100] text-[#2F1107] hover:bg-[#2F1107] hover:text-[#ffd100] h-12 px-4 py-2 rounded-full w-full duration-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {step === 9 ? (
                                    isPending ? "Finishing..." : "Finish"
                                ) : (
                                    "Next"
                                )}
                            </button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AboutMeModal