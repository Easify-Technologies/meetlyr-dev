"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { addUser } from "@/app/services/add-user";
import { Progress } from "@/components/ui/progress";

const MatchingClient = () => {
  const [progress, setProgress] = useState(10);
  const [showMatchedSection, setShowMatchedSection] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const progressTimer = setTimeout(() => setProgress(66), 500);

    const redirectTimer = setTimeout(async () => {
      setShowMatchedSection(true);

      // Extract all query params
      const params = Object.fromEntries(searchParams.entries());

      // Convert the comma-separated peopleType string into an array
      const peopleTypeArray = params.peopleType
        ? params.peopleType.split(",")
        : [];

      // Build user data (no cafe_id here)
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

      console.log("Registering user:", userData);

      try {
        await addUser(userData);
      } catch (error) {
        console.error("Registration failed:", error);
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

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto flex flex-col gap-6 text-center px-4 pt-10 pb-4">
                  {showMatchedSection ? (
                    <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">
                      You&apos;re in. We&apos;ll find your perfect table soon!
                    </h1>
                  ) : (
                    <>
                      <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#2F1107] font-semibold">
                        One moment, we’re setting up your profile…
                      </h1>
                      <Progress value={progress} className="w-full" />
                    </>
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
