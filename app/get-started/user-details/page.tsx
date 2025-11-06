"use client";
export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PhoneNumberInput from "@/components/comp-46";
import { Eye, EyeOff } from "lucide-react";

interface UserDetailsProps {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

const Page = () => {
  const searchParams = useSearchParams();
  const city_id = searchParams.get("city_id") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserDetailsProps>({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const { name, email, phoneNumber, password } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Disable "Next" if form incomplete
  const isFormComplete =
    name.trim() && email.trim() && phoneNumber.trim() && password.trim();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* LEFT SIDE FORM */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto h-full">
          <div className="h-full flex flex-col p-4">
            {/* Header */}
            <div className="grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center min-h-0 lg:min-h-20 p-4 w-full">
              <div className="flex items-center gap-2 w-20">
                <Image
                  src="/Mocha-e1760632297719.webp"
                  alt="Meetly"
                  width={200}
                  height={200}
                  quality={100}
                  priority
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="h-full flex flex-col">
                <form
                  encType="multipart/form-data"
                  className="flex-1 overflow-y-auto flex flex-col gap-6 text-center px-4 pt-10 pb-4"
                >
                  {/* Name */}
                  <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">
                    What is your name?
                  </h1>
                  <input
                    type="text"
                    value={name}
                    id="name"
                    name="name"
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="bg-muted px-5 py-2 outline-none border-0 rounded-full w-full h-12 text-[#2F1107] font-medium text-base"
                  />

                  {/* Email */}
                  <div className="pt-6 border-t border-[#f7f0f2]">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">
                      What is your email?
                    </h1>
                    <input
                      type="email"
                      value={email}
                      id="email"
                      name="email"
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="bg-muted px-5 py-2 outline-none border-0 rounded-full w-full h-12 text-[#2F1107] font-medium text-base mt-6"
                    />
                  </div>

                  {/* Phone */}
                  <div className="pt-6 border-t border-[#f7f0f2]">
                    <div className="mt-4">
                      <PhoneNumberInput
                        phone={phoneNumber}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, phoneNumber: value }))
                        }
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="py-6 border-t border-[#f7f0f2]">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">
                      What is your password?
                    </h1>
                    <div className="flex relative items-center justify-between bg-muted rounded-full px-5 py-2 h-16 mt-4 border border-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        onChange={handleChange}
                        className="w-full outline-0 bg-transparent"
                        placeholder="Password"
                        value={password}
                        id="password"
                        name="password"
                      />
                      <button
                        onClick={() => setShowPassword((prev) => !prev)}
                        type="button"
                        className="cursor-pointer text-muted-foreground"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </form>

                {/* ✅ Footer Buttons */}
                <div className="p-4 bg-background">
                  <Link
                    href={
                      isFormComplete
                        ? `/get-started/questions?city_id=${city_id}&name=${encodeURIComponent(
                            name
                          )}&email=${encodeURIComponent(
                            email
                          )}&phoneNumber=${encodeURIComponent(
                            phoneNumber
                          )}&password=${encodeURIComponent(password)}`
                        : "#"
                    }
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base font-medium transition-all select-none h-12 px-4 py-2 rounded-full w-full duration-500 ${
                      isFormComplete
                        ? "bg-[#FFD100] text-[#2F1107] hover:bg-[#2F1107] hover:text-[#FFD100]"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Next Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
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
  );
};

export default Page;
