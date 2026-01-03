"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import MultipleSelector, { Option } from "@/components/ui/multiselect";

const one_liner: Option[] = [
  { value: "ambitious", label: "Ambitious" },
  { value: "adventurous", label: "Adventurous" },
  { value: "outgoing", label: "Outgoing" },
  { value: "introvert", label: "Introvert" },
  { value: "extrovert", label: "Extrovert" },
  { value: "empathetic", label: "Empathetic" },
  { value: "creative", label: "Creative" },
  { value: "curious", label: "Curious" },
  { value: "logical", label: "Logical" },
  { value: "funny", label: "Funny" },
  { value: "calm", label: "Calm" },
  { value: "spontaneous", label: "Spontaneous" },
  { value: "organized", label: "Organized" },
  { value: "thoughtful", label: "Thoughtful" },
  { value: "motivated", label: "Motivated" },
];

export default function OneLinerDropdown({ setFormData }: { setFormData: any }) {
  const id = useId();
  const [selected, setSelected] = useState<Option[]>([]);

  const MAX_SELECTION = 3;
  const disabledOptions = selected.length >= MAX_SELECTION;

  const handleSelectionChange = (values: Option[]) => {
    if (values.length > 3) return;

    setSelected(values);
    const valueString = values.map((v) => v.value).join(", ");
    setFormData((prev: any) => ({ ...prev, oneLiner: valueString }));
  };

  return (
    <div className="*:not-first:mt-2">
      <Label
        htmlFor={id}
        className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold"
      >
        Describe yourself in 3 words
      </Label>
      <MultipleSelector
        commandProps={{
          label: "Describe Yourself",
          shouldFilter: true,
          autoFocus: false,
        }}
        value={selected}
        onChange={handleSelectionChange}
        maxSelected={3}
        defaultOptions={one_liner.map(opt => ({
          ...opt,
          disabled: disabledOptions && !selected.some(s => s.value === opt.value),
        }))}
        placeholder="Describe Yourself"
        className="mt-4 rounded-full px-5 py-3 text-base"
        hideClearAllButton
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm">No results found</p>}
      />
    </div>
  );
}
