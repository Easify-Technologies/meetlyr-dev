'use client';

import { FaHouseUser } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { FaMapLocationDot } from "react-icons/fa6";
import { IoIosCafe } from "react-icons/io";
import { SiGoogleads } from "react-icons/si";
import { TbBulbFilled } from "react-icons/tb";

import { useFetchAllAdminData } from '@/app/queries/admin/dashboard';
import Loader from '@/components/ui/loader';
import KpiCard from "@/components/ui/Kpis";

const Page = () => {
  const {
    users = [],
    cafes = [],
    locations = [],
    events = [],
    leads = [],
    suggestions = [],
    isLoading,
  } = useFetchAllAdminData();

  const convertedLeads = leads.filter(
    (lead: { status: string }) => lead.status === "completed"
  ).length;

  const leadConversionRate = leads.length
    ? Math.round((convertedLeads / leads.length) * 100)
    : 0;

  if (isLoading) return <Loader />

  return (
    <>
      <section className='w-screen min-h-screen bg-[#FFFFF5] relative'>
        <div className="w-full mx-auto py-8 px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#2f1107] font-semibold text-left mb-4">
            Dashboard
          </h1>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            <KpiCard
              icon={<FaHouseUser size={30} />}
              value={users.length}
              label="Users"
              change={12}
              trend="up"
              period="Last 30 days"
            />

            <KpiCard
              icon={<MdEvent size={30} />}
              value={events.length}
              label="Events"
              change={-5}
              trend="down"
              period="Last 30 days"
            />

            <KpiCard
              icon={<FaMapLocationDot size={30} />}
              value={locations.length}
              label="Locations"
              change={8}
              trend="up"
              period="Last 30 days"
            />

            <KpiCard
              icon={<IoIosCafe size={30} />}
              value={cafes.length}
              label="Cafes"
              change={8}
              trend="up"
              period="Last 30 days"
            />

            <KpiCard
              icon={<SiGoogleads size={30} />}
              value={`${leadConversionRate}%`}
              label="Leads"
              change={+8}
              trend="up"
              period="Last 30 days"
            />

            <KpiCard
              icon={<TbBulbFilled size={30} />}
              value={suggestions.length}
              label="Suggestions"
              change={-12}
              trend="down"
              period="Last 30 days"
            />

          </div>

        </div>
      </section>
    </>
  )
}

export default Page