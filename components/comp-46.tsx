"use client";

import React from "react";
import { ChevronDownIcon, PhoneIcon } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneNumberInputProps {
  phone: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const PhoneNumberInput = ({ phone, onChange, disabled }: PhoneNumberInputProps) => {
  const path = usePathname();
  return (
    <div className="mt-6" dir="ltr">
      <Label
        htmlFor="phone_number"
        className="text-[#2f1107] text-base font-semibold mb-2"
      >
        {path === "/get-started/user-details" ? (
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold mb-6">What is your Phone number?</h1>
        ) : (
          "Phone number"
        )}
      </Label>
      <RPNInput.default
        className="flex shadow-xs mt-2"
        international
        disabled={disabled}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={PhoneInput}
        id="phone_number"
        value={phone}
        onChange={(newValue) => onChange(newValue ?? "")}
      />
    </div>
  );
};

const PhoneInput = ({ className, ...props }: React.ComponentProps<"input">) => {
  const path = usePathname();
  return (
    <Input
      data-slot="phone-input"
      className={cn(
        `${path == "/get-started/user-details" ? "w-full border border-[#2f1107] text-[#2f1107] bg-transparent outline-none text-base font-semibold px-5 py-2" : "w-full border border-[#2f1107] text-[#2f1107] bg-transparent outline-none text-sm font-semibold p-2"}`,
        className
      )}
      {...props}
    />
  );
};

PhoneInput.displayName = "PhoneInput";

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: { label: string; value: RPNInput.Country | undefined }[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as RPNInput.Country);
  };

  return (
    <div className="relative inline-flex items-center self-stretch rounded-md border border-[#2f1107] bg-transparent py-2 ps-3 pe-2 text-muted-foreground transition-[color,box-shadow] outline-none focus-within:z-10 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 hover:bg-accent hover:text-foreground has-disabled:pointer-events-none has-disabled:opacity-50 has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40">
      <div className="inline-flex items-center gap-1" aria-hidden="true">
        <FlagComponent country={value} countryName={value} aria-hidden="true" />
        <span className="text-muted-foreground/80">
          <ChevronDownIcon size={16} aria-hidden="true" />
        </span>
      </div>
      <select
        disabled={disabled}
        value={value}
        onChange={handleSelect}
        className="absolute inset-0 text-sm opacity-0 bg-transparent"
        aria-label="Select country"
      >
        <option key="default" value="">
          Select a country
        </option>
        {options
          .filter((x) => x.value)
          .map((option, i) => (
            <option key={option.value ?? `empty-${i}`} value={option.value}>
              {option.label}{" "}
              {option.value &&
                `+${RPNInput.getCountryCallingCode(option.value)}`}
            </option>
          ))}
      </select>
    </div>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="w-5 overflow-hidden rounded-sm">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <PhoneIcon size={16} aria-hidden="true" />
      )}
    </span>
  );
};

export default PhoneNumberInput;