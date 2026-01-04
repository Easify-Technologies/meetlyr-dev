"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const QuestionClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<number>(1);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [formData, setFormData] = useState({
    connectionStyle: "",
    communicationStyle: "",
    socialStyle: "",
    healthFitnessStyle: "",
    family: "",
    spirituality: "",
    politicsNews: "",
    humor: "",
    peopleType: ""
  });

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

      // Clear UI selections for previous step
      setSelectedStyle("");
      setSelectedMulti([]);
      setSliderValue([0]);
    } else {
      // If at step 1 → go back to user-details page
      router.push(`/get-started/user-details?city_id=${searchParams.get("city_id") ?? ""}`);
    }
  };

  const isDisabled = (() => {
    if (currentConfig.type === "radio") return !selectedStyle;
    if (currentConfig.type === "slider") return sliderValue[0] === 0;
    if (currentConfig.type === "multi") return !(selectedMulti && selectedMulti.length > 0);
    return true;
  })();

  const goNextWithValue = (valueToSave: string) => {
    const { key } = currentConfig;

    const updatedForm = { ...formData, [key]: valueToSave };
    setFormData(updatedForm);

    const params = new URLSearchParams(searchParams.toString());
    params.set(key, valueToSave);
    router.replace(`?${params.toString()}`, { scroll: false });

    if (step < 9) {
      setStep((s) => s + 1);
      setSelectedStyle("");
      setSelectedMulti([]);
      setSliderValue([0]);
    } else {
      console.log("✅ Final Form Data:", updatedForm);
      localStorage.removeItem("user-details-form");
      router.push(`/get-started/about?${params.toString()}`);
    }
  };

  const handleNext = () => {
    const { type } = currentConfig;

    let valueToSave: string | null = null;

    if (type === "radio") {
      valueToSave = selectedStyle || null;
    } else if (type === "slider") {
      valueToSave =
        sliderValue && sliderValue.length > 0 ? String(sliderValue[0]) : null;
    } else if (type === "multi") {
      valueToSave =
        selectedMulti && selectedMulti.length > 0
          ? selectedMulti.join(",")
          : null;
    }

    if (!valueToSave) return;

    goNextWithValue(valueToSave);
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

  const sliderText = sliderValue[0] > 0 ? getSliderLabel(sliderValue[0]) : "";

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());

    // Find the highest completed step based on URL params
    const stepKeys = Object.values(stepConfig).map((c) => c.key);

    let lastStep = 1;
    for (let i = 0; i < stepKeys.length; i++) {
      if (params[stepKeys[i]]) lastStep = i + 1;
    }

    setStep(lastStep);
  }, []);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const { key, type } = currentConfig;

    if (!params[key]) return;

    if (type === "radio") setSelectedStyle(params[key]);
    if (type === "slider") setSliderValue([Number(params[key])]);
    if (type === "multi") setSelectedMulti(params[key].split(","));
  }, [step, searchParams]);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto h-full">
            <div className="h-full flex flex-col p-4">
              <div className="">
                <div className="grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center min-h-0 lg:min-h-20 p-4 w-full">
                  <div className="flex items-center gap-2 w-20">
                    <Link href="/">
                      <Image
                        src="/Mocha-e1760632297719.webp"
                        alt="Meetly"
                        width={200}
                        height={200}
                        quality={100}
                        priority
                      />
                    </Link>
                  </div>
                  <div className="hidden lg:flex items-center gap-6"></div>
                  <div className="flex items-center justify-end"></div>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto flex flex-col gap-6 text-center px-4 pt-10 pb-4">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">{stepHeadings[step]}</h1>
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
                  </div>
                  <div className="p-4 bg-background flex items-center justify-center gap-4">
                    <button className="bg-[#ffd100] cursor-pointer h-12 px-4 py-2 rounded-full w-full text-sm md:text-base font-medium transition-all duration-500 hover:bg-[#2f1107] hover:text-white" onClick={handleBackButton} type="button">
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isDisabled}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all select-none bg-[#FFD100] text-[#2F1107] hover:bg-[#2F1107] hover:text-[#ffd100] h-12 px-4 py-2 rounded-full w-full duration-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {step === 9 ? "Finish" : "Next"}
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
  );
}

export default QuestionClient;