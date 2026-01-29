'use client';

import { FaHouseUser } from "react-icons/fa";
import { MdPayments, MdAutorenew, MdOutlineMoneyOff, MdOutlineStar, MdOutlineReportProblem } from "react-icons/md";

import { useFetchAllAdminData } from '@/app/queries/admin/dashboard';
import Loader from '@/components/ui/loader';
import KpiCard from "@/components/ui/Kpis";
import { TbBulbFilled } from "react-icons/tb";
import { SiGoogleads } from "react-icons/si";

const Page = () => {
  const {
    users = [],
    leads = [],
    suggestions = [],
    payments = [],
    feedbacks = [],
    isLoading,
  } = useFetchAllAdminData();

  const safeLeads = Array.isArray(leads) ? leads : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  const convertedLeads = safeLeads.filter(
    (lead: { status: string }) => lead.status === "completed"
  ).length;

  const leadConversionRate = safeLeads.length
    ? Math.round((convertedLeads / safeLeads.length) * 100)
    : 0;

  const freePayments = safePayments.filter((p) => p.mode === "free").length;
  const oneTimePayments = safePayments.filter((p) => p.mode === "payment").length;
  const subscriptionPayments = safePayments.filter((p) => p.mode === "subscription").length;

  const paidUsers = oneTimePayments + subscriptionPayments;

  const paidUserRate = safePayments.length
    ? Math.round((paidUsers / safePayments.length) * 100)
    : 0;

  const subscriptionRate = safePayments.length
    ? Math.round((subscriptionPayments / safePayments.length) * 100)
    : 0;

  const freeUserRate = safePayments.length
    ? Math.round((freePayments / safePayments.length) * 100)
    : 0;

  const validRatings = safeFeedbacks
    .map(f => Number(f.overallRating))
    .filter(r => !isNaN(r) && r > 0);

  const averageRating =
    validRatings.length > 0
      ? (
        validRatings.reduce((sum, r) => sum + r, 0) /
        validRatings.length
      ).toFixed(1)
      : "0.0";

  const positiveFeedbacks = safeFeedbacks.filter(
    f => f.overallRating >= 4
  ).length;

  const negativeFeedbacks = safeFeedbacks.filter(
    f => f.overallRating <= 2
  ).length;

  const positiveRate = safeFeedbacks.length
    ? Math.round((positiveFeedbacks / safeFeedbacks.length) * 100)
    : 0;

  const totalSuggestions = safeSuggestions.length;

  if (isLoading) return <Loader />

  return (
    <>
      <section className='w-screen min-h-screen bg-[#FFFFF5] relative'>
        <div className="w-full mx-auto py-8 px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#2f1107] font-semibold text-left mb-4">
            Dashboard
          </h1>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {/* USERS */}
            <KpiCard
              icon={<FaHouseUser size={30} />}
              value={users.length}
              label="Users"
              change={12}
              trend="up"
              period="Last 30 days"
            />

            {/* PAID USERS */}
            <KpiCard
              icon={<MdPayments size={30} />}
              value={`${paidUserRate}%`}
              label="Paid Users"
              change={6}
              trend="up"
              period="Last 30 days"
            />

            {/* SUBSCRIPTIONS */}
            <KpiCard
              icon={<MdAutorenew size={30} />}
              value={`${subscriptionRate}%`}
              label="Subscriptions"
              change={4}
              trend="up"
              period="Last 30 days"
            />

            {/* FREE USERS */}
            <KpiCard
              icon={<MdOutlineMoneyOff size={30} />}
              value={`${freeUserRate}%`}
              label="Free Users"
              change={-5}
              trend="down"
              period="Last 30 days"
            />

            {/* AVG FEEDBACK */}
            <KpiCard
              icon={<MdOutlineStar size={30} />}
              value={averageRating}
              label="Avg Rating"
              change={2}
              trend="up"
              period="Last 30 days"
            />

            {/* NEGATIVE FEEDBACK ALERT */}
            <KpiCard
              icon={<MdOutlineReportProblem size={30} />}
              value={negativeFeedbacks}
              label="Low Ratings"
              change={-3}
              trend="down"
              period="Last 30 days"
            />

            {/* SUGGESTIONS */}
            <KpiCard
              icon={<TbBulbFilled size={30} />}
              value={totalSuggestions}
              label="Suggestions"
              change={0}
              trend="up"
              period="Overall"
            />

            {/* LEADS */}
            <KpiCard
              icon={<SiGoogleads size={30} />}
              value={`${leadConversionRate}%`}
              label="Leads"
              change={+8}
              trend="up"
              period="Last 30 days"
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default Page