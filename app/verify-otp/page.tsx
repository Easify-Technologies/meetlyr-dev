'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useVerifyOTP } from '../queries/verify-otp';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

const Page = () => {
    const [otp, setOtp] = useState("");

    const { mutate, isPending, isSuccess, isError, data, error } = useVerifyOTP();

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
                        <h1 className="text-4xl text-[#2f1107] font-semibold md:text-5xl lg:text-6xl text-center mb-4">Verify Your OTP</h1>
                        <div className="grid w-full items-center justify-center gap-3">
                            <div className="relative flex justify-center">
                                <div className="space-y-2 text-center mx-auto">
                                    <InputOTP
                                        className="flex justify-center"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(value) => setOtp(value)}
                                    >
                                        <InputOTPGroup className="flex justify-center gap-2">
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>

                                    <div className="text-center mt-3 text-[#2f1107] font-semibold text-sm">
                                        {otp === "" ? (
                                            <>Enter your one-time password.</>
                                        ) : (
                                            <>You entered: {otp}</>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {isError && (
                                <div data-slot="form-message" className="text-destructive text-sm text-center w-full md:whitespace-nowrap font-semibold">{(error as Error).message}</div>
                            )}
                            {isSuccess && data?.message && (
                                <div data-slot="form-message" className="text-green-500 text-sm text-center w-full md:whitespace-nowrap font-semibold">{data.message}</div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col gap-4 justify-center items-center">
                            <button onClick={() => mutate({ otp })} className="inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer text-sm md:text-base font-medium transition-all bg-[#FFD100] text-[#2f1107] hover:bg-[#FFD100]/90 h-12 px-4 py-2 rounded-full w-full" type="button" disabled={isPending}>
                                {isPending ? "Verifying..." : "Verify"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Page