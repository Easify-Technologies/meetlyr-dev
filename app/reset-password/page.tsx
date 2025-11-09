'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";

import { useResetPassword } from '../queries/reset-password';

interface PasswordProps {
  password: string;
  confirm_password: string;
}

const Page = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<PasswordProps>({
    password: "",
    confirm_password: ""
  });

  const { password, confirm_password } = formData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const { mutate, isPending, isSuccess, isError, data, error } = useResetPassword();

  return (
    <>
      <div className="h-full flex flex-col p-4">
        <div className="">
          <div className="grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center min-h-0 lg:min-h-20 p-4 w-full">
            <Link href="/" className="flex items-center gap-2 w-20">
              <Image
                src="/Mocha-e1760632297719.webp"
                alt="Meetly"
                width={200}
                height={200}
                quality={100}
                priority
              />
            </Link>
            <div className="hidden lg:flex items-center gap-6"></div>
            <div className="flex items-center justify-end"></div>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-center items-center">
          <form className="flex flex-col  w-full gap-4 max-w-sm">
            <h1 className="text-4xl text-[#2f1107] font-semibold md:text-5xl lg:text-6xl text-center mb-4">Create Password</h1>
            <div className="grid w-full items-center gap-3">
              <div className="relative">
                <div className='flex relative items-center justify-between bg-muted rounded-full px-5 py-2 h-16 mt-4 border border-input'>
                  <input type={showPassword ? "text" : "password"} onChange={handleInputChange} className='w-full outline-0' placeholder='Password' value={password} id='password' name='password' />
                  <button onClick={() => setShowPassword((prev) => !prev)} type="button" className='cursor-pointer text-muted-foreground'>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className='flex relative items-center justify-between bg-muted rounded-full px-5 py-2 h-16 mt-4 border border-input'>
                  <input type={showConfirmPassword ? "text" : "password"} onChange={handleInputChange} className='w-full outline-0' placeholder='Confirm Password' value={confirm_password} id='confirm_password' name='confirm_password' />
                  <button onClick={() => setShowConfirmPassword((prev) => !prev)} type="button" className='cursor-pointer text-muted-foreground'>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {isError && (
                <p data-slot="form-message" className="text-destructive text-sm">{(error as Error).message}</p>
              )}
              {isSuccess && data?.message && (
                <p data-slot="form-message" className="text-green-500 text-sm">{data.message}</p>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-4 justify-center items-center">
              <button onClick={() => mutate(formData)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer text-sm md:text-base font-medium transition-all bg-[#FFD100] text-[#2f1107] hover:bg-[#FFD100]/90 h-12 px-4 py-2 rounded-full w-full" disabled={isPending} type="button">
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Page