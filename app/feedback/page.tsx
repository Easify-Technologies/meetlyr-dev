"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/ui/Navbar";

import { EmojiRating } from "@/components/EmojiRating";
import StarRatingComponent from "@/components/comp-171";
import { useSendFeedback } from "../queries/feedback";

interface MatchedUsers {
  id: string;
  name: string;
  avatar: string;
}

type ParticipantFeedback = {
  participantId: string;
  rating: number;
  present: boolean;
};

const TOTAL_STEPS = 4;

const RatingRow = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (val: any) => void;
}) => (
  <div className="flex flex-col gap-2 text-center">
    <p className="font-medium">{label}</p>
    <div className="flex justify-center">
      <StarRatingComponent value={value} onChange={onChange} />
    </div>
  </div>
);

const Page = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [currentStep, setCurrentStep] = useState(1);
  const [participantIndex, setParticipantIndex] = useState(0);
  const [participantFeedback, setParticipantFeedback] = useState<ParticipantFeedback[]>([]);
  const [matchGroupUsers, setMatchGroupUsers] = useState<MatchedUsers[]>([]);
  const [eventData, setEventData] = useState({
    eventId: "",
    cafeId: "",
    cafeName: "",
    cafeAddress: "",
  });

  const { eventId, cafeId, cafeName, cafeAddress } = eventData;

  const [rating, setRating] = useState({
    overall: "",
    participant: "",
    cafe: "",
    atmosphere: "",
    food: "",
    service: ""
  });

  const { mutate, isPending } = useSendFeedback();

  useEffect(() => {
    setEventData(prev => ({
      ...prev,
      eventId: localStorage.getItem("eventId") ?? "",
      cafeId: localStorage.getItem("cafeId") ?? "",
      cafeName: localStorage.getItem("cafeName") ?? "",
      cafeAddress: localStorage.getItem("cafeAddress") ?? ""
    }));

    const storedUsers = localStorage.getItem("matchGroupUsers");

    if (storedUsers) {
      setMatchGroupUsers(JSON.parse(storedUsers));
    }
  }, []);

  useEffect(() => {
    if (currentStep !== 2) {
      setParticipantIndex(0);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 2 && participantIndex < matchGroupUsers.length - 1) {
      setParticipantIndex(prev => prev + 1);
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === 2 && participantIndex > 0) {
      setParticipantIndex(prev => prev - 1);
      return;
    }

    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    mutate({
      eventId,
      cafeId,
      userId,
      overallRating: Number(rating.overall),
      cafeRating: Number(rating.cafe),
      atmosphereRating: Number(rating.atmosphere),
      foodRating: Number(rating.food),
      serviceRating: Number(rating.service),
      participantFeedback
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h4 className="text-2xl font-semibold mb-1">How was your event?</h4>
            <p className="text-neutral-600 mb-4">Rate your overall experience</p>

            <div className="mb-4">
              {/* Avatar stack */}
              <div className="flex items-center justify-center mb-2">
                {matchGroupUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-200"
                    style={{
                      marginLeft: index === 0 ? 0 : -10,
                      zIndex: 10 - index,
                    }}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Names */}
              <p className="text-base font-semibold text-gray-700 mt-2">
                You were matched with{" "}
                <span className="font-bold">
                  {matchGroupUsers.map((u) => u.name).join(", ")}
                </span>
              </p>
            </div>

            <StarRatingComponent
              value={rating.overall}
              onChange={(val: any) =>
                setRating(prev => ({ ...prev, overall: val }))
              }
            />
          </>
        );

      case 2: {
        if (!matchGroupUsers.length) return null;

        const user = matchGroupUsers[participantIndex];
        const existing = participantFeedback.find(
          p => p.participantId === user.id
        );

        return (
          <>
            <h4 className="text-2xl font-semibold mb-6">
              What did you think of {user.name}?
            </h4>

            <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
              <img src={user.avatar} alt={user.name} />
            </div>

            <EmojiRating
              value={existing?.rating}
              onSelect={(rating) =>
                setParticipantFeedback(prev => {
                  const filtered = prev.filter(p => p.participantId !== user.id);
                  return [
                    ...filtered,
                    { participantId: user.id, rating, present: true }
                  ];
                })
              }
            />
          </>
        );
      }

      case 3:
        return (
          <>
            <h4 className="text-2xl font-semibold mb-6">
              What did you think of the Café?
            </h4>

            <div className="bg-white shadow-sm rounded-lg py-3 px-4 mb-3.5 w-full">
              <div className="flex flex-col items-start justify-start gap-1.5 mb-2">
                <h4 className="text-neutral-600 text-start text-base font-semibold">Café</h4>
                <span className="text-sm font-semibold text-[#2f1107]">{cafeName}</span>
              </div>
              <div className="flex flex-col items-start justify-start gap-1.5 mb-2">
                <h4 className="text-neutral-600 text-start text-base font-semibold mt-3.5">Address</h4>
                <span className="text-sm font-semibold text-[#2f1107]">{cafeAddress}</span>
              </div>
            </div>

            <StarRatingComponent
              value={rating.cafe}
              onChange={(val: any) =>
                setRating(prev => ({ ...prev, cafe: val }))
              }
            />
          </>
        );

      case 4:
        return (
          <>
            <h4 className="text-2xl font-semibold mb-6">
              Can you give us more details?
            </h4>

            <div className="space-y-6 w-full">
              <RatingRow
                label="How did you find the atmosphere?"
                value={rating.atmosphere}
                onChange={(val: any) =>
                  setRating(prev => ({ ...prev, atmosphere: val }))
                }
              />

              <RatingRow
                label="How did you find the food?"
                value={rating.food}
                onChange={(val: any) =>
                  setRating(prev => ({ ...prev, food: val }))
                }
              />

              <RatingRow
                label="How did you find the service?"
                value={rating.service}
                onChange={(val: any) =>
                  setRating(prev => ({ ...prev, service: val }))
                }
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return Boolean(rating.overall);
      case 2:
        return participantFeedback.length === matchGroupUsers.length;
      case 3:
        return Boolean(rating.cafe);
      case 4:
        return Boolean(rating.atmosphere && rating.food && rating.service);
      default:
        return false;
    }
  };

  return (
    <>
      <Navbar />

      <section className="relative bg-gradient-to-b from-amber-50 to-white px-5 py-16 flex flex-col items-center">
        <h2 className="text-[#2f1107] text-3xl font-bold mb-5">Feedback</h2>
        {/* Progress Bar */}
        <div className="w-full max-w-md h-1.5 bg-neutral-200 rounded-full mb-8">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-900 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="w-full max-w-md flex flex-col items-center text-center">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="w-full max-w-md mt-8 pb-6">
          <button
            onClick={handleNext}
            disabled={!isStepValid() || isPending}
            className={`
            w-full py-3 rounded-full font-semibold transition-colors
            ${isStepValid()
                ? "bg-[#ffd100] text-[#2f1107] duration-300 cursor-pointer hover:bg-[#2f1107] hover:text-[#ffd100]"
                : "bg-neutral-300 text-neutral-500 cursor-not-allowed"}
            `}
          >
            {currentStep === TOTAL_STEPS
              ? isPending ? "Submitting..." : "Submit"
              : "Next"}
          </button>

          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="w-full bg-black text-base text-white mt-3 cursor-pointer duration-500 hover:bg-neutral-700 py-3 rounded-full font-semibold"
            >
              Back
            </button>
          )}
        </div>
      </section>
    </>
  );
};

export default Page;