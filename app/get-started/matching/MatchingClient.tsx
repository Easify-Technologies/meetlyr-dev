"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { addUser } from "@/app/services/add-user";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const MatchingClient = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(10);
  const [showMatchedSection, setShowMatchedSection] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();

  const percentage = ["90%", "91%", "92%", "93%", "94%", "95%", "96%", "97%"];
  const randomPercentage = percentage[Math.floor(Math.random() * percentage.length)];

  useEffect(() => {
    const progressTimer = setTimeout(() => setProgress(66), 500);

    const redirectTimer = setTimeout(async () => {
      setShowMatchedSection(true);

      const params = Object.fromEntries(searchParams.entries());
      const peopleTypeArray = params.peopleType
        ? params.peopleType.split(",")
        : [];

      const userData = {
        name: params.name || "",
        email: params.email || "",
        phoneNumber: params.phoneNumber || "",
        gender: params.gender || "",
        avatar: params.avatar || "",
        dateOfBirth: params.dateOfBirth || "",
        city_id: params.city_id || "",
        oneLiner: params.oneLiner || "",
        connectionStyle: params.connectionStyle || "",
        communicationStyle: params.communicationStyle || "",
        socialStyle: params.socialStyle || "",
        healthFitnessStyle: params.healthFitnessStyle || "",
        family: params.family || "",
        spirituality: params.spirituality || "",
        politicsNews: params.politicsNews || "",
        humor: params.humor || "",
        peopleType: peopleTypeArray,
        password: params.password || "",
      };

      try {
        await addUser(userData);
      } catch (error) {
        setErrorMessage(error.message);
      }
    }, 1000);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(redirectTimer);
    };
  }, [searchParams]);


  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto h-full">
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between gap-2 px-4 pb-5 w-full">
              <IoMdArrowRoundBack size={24} className="cursor-pointer w-10 h-10 rounded-full p-2 flex items-center justify-center text-[#2f1107] hover:bg-[#2f1710] hover:text-white" onClick={() => router.back()} />
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
                <div className="flex-1 overflow-y-auto flex flex-col gap-6 text-center px-4 pt-10 pb-4">
                  {showMatchedSection ? (
                    <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">
                      You&apos;re all set! We found people who match your vibe — {randomPercentage} compatible.
                    </h1>
                  ) : (
                    <>
                      <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">
                        One moment, we’re setting up your profile…
                      </h1>
                      <Progress value={progress} className="w-full" />
                    </>
                  )}
                  {errorMessage && (
                    errorMessage === "User already exists" ? (
                      <div className="flex flex-col gap-1 items-center mt-5">
                        <p className="text-green-600 font-semibold text-base">
                          Looks like you&apos;re already registered!
                        </p>
                        <p className="text-neutral-700 text-sm">
                          Please sign in to access your account.
                        </p>
                        <Link
                          href="/login"
                          className="underline text-blue-600 font-semibold text-base mt-1"
                        >
                          Login to your account
                        </Link>
                      </div>
                    ) : (
                      <p className="text-red-600 font-semibold text-base mt-5">{errorMessage}</p>
                    )
                  )}
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
  );
};

export default MatchingClient;
