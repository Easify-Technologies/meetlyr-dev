"use client";

import { GiRoundStar } from "react-icons/gi";
import { useId, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function StarRatingComponent({ value, onChange }) {
  const id = useId();
  const [hoverRating, setHoverRating] = useState("");

  const displayRating = hoverRating || value;

  return (
    <fieldset className="space-y-4">
      <RadioGroup
        className="inline-flex gap-0"
        value={value}
        onValueChange={onChange}
      >
        {["1", "2", "3", "4", "5"].map((v) => (
          <label
            key={v}
            className="group relative cursor-pointer rounded p-0.5"
            onMouseEnter={() => setHoverRating(v)}
            onMouseLeave={() => setHoverRating("")}
          >
            <RadioGroupItem className="sr-only" id={`${id}-${v}`} value={v} />

            <GiRoundStar
              className={`transition-all w-9 h-9 ${
                displayRating >= v ? "text-amber-500" : "text-neutral-400"
              } group-hover:scale-110`}
            />
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
