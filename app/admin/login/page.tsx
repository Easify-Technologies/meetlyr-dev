'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Eye, EyeOff } from "lucide-react";
import { useAdminLogin } from '@/app/queries/admin/login';

interface LoginProps {
  email: string;
  password: string;
}

const Page = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginProps>({
    email: "",
    password: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const { email, password } = formData;

  const { mutate, isPending, isSuccess, isError, error, data } = useAdminLogin();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleLogin = () => {
    mutate(formData);
  }

  return (
    <>
      <div className="h-full flex flex-col p-4">
        <div className="">
          <div className="grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center min-h-0 lg:min-h-20 p-4 w-full">
            <Link href="#" className="flex items-center gap-2 w-20">
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
            <h1 className="text-4xl text-[#2f1107] font-semibold md:text-5xl lg:text-6xl text-center mb-4">Sign in</h1>
            <div className="grid w-full items-center gap-3">
              <div className="relative">
                <input onChange={handleInputChange} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-16 w-full min-w-0 rounded-full border bg-muted px-5 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm" aria-placeholder="Email" placeholder="Email" id="email" type="email" value={email} name="email" />
                <div className='flex relative items-center justify-between bg-muted rounded-full px-5 py-2 h-16 mt-4 border border-input'>
                  <input type={showPassword ? "text" : "password"} onChange={handleInputChange} className='w-full outline-0' placeholder='Password' value={password} id='password' name='password' />
                  <button onClick={() => setShowPassword((prev) => !prev)} type="button" className='cursor-pointer text-muted-foreground'>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              <button onClick={handleLogin} disabled={isPending} className="inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer text-sm md:text-base font-medium transition-all bg-[#FFD100] text-[#2f1107] hover:bg-[#FFD100]/90 h-12 px-4 py-2 rounded-full w-full" type="button">
                {isPending ? "Redirecting..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Page