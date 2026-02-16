"use client"

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdMenu } from "react-icons/md";
import Loader from "@/components/ui/loader";
import { IoHomeOutline } from "react-icons/io5";
import { LuCircleUserRound } from "react-icons/lu";
import { FaMapLocationDot } from "react-icons/fa6";
import { MdEvent, MdGroups2, MdCoffee, MdFeedback } from "react-icons/md";
import { HiOutlineLightBulb } from "react-icons/hi";
import { IoIosLogOut } from "react-icons/io";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { MdLeaderboard } from "react-icons/md";
import { FaGifts } from "react-icons/fa";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { icon: IoHomeOutline, label: "Dashboard", path: "/admin/dashboard" },
    { icon: LuCircleUserRound, label: "Users", path: "/admin/users" },
    { icon: FaMapLocationDot, label: "Locations", path: "/admin/locations" },
    { icon: MdEvent, label: "Events", path: "/admin/events" },
    { icon: MdCoffee, label: "Cafes", path: "/admin/cafe" },
    { icon: FaGifts, label: "Promo Code", path: "/admin/promo-code" },
    { icon: MdLeaderboard, label: "Leads", path: "/admin/leads" },
    { icon: MdGroups2, label: "Participants", path: "/admin/participants" },
    { icon: GiForkKnifeSpoon, label: "Manual Matching", path: "/admin/match-event" },
    { icon: MdFeedback, label: "Feedback", path: "/admin/feedback" },
    { icon: HiOutlineLightBulb, label: "Suggestions", path: "/admin/suggestions" },
    { icon: IoIosLogOut, label: "Logout", path: "/admin/login" },
  ]

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.replace("/admin/login");
    }

    setIsAuthChecked(true);
  }, [router]);

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (!isAuthChecked) return <Loader />

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar - Collapsible */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40 ${isSidebarCollapsed ? 'w-24' : 'w-64'
          }`}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full py-8">
          {/* Logo */}
          <div className="mb-8 transition-all duration-300 text-center mx-auto">
            {!isSidebarCollapsed ? (
              <Image
                src="/Mocha-e1760632297719.webp"
                alt="meetlyr"
                width={140}
                height={100}
                priority
                quality={100}
                className="cursor-pointer"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            ) : (
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-12 h-12 mr-3 bg-[#2f1107] rounded-lg flex items-center justify-center text-white font-bold text-xl cursor-pointer">
                M
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className={`flex-1 overflow-y-auto px-3 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
            <ul className="space-y-2">
              {items.map((item, idx) => (
                <li key={idx}>
                  {item.path === "/admin/login" ? (
                    <button
                      onClick={() => {
                        localStorage.removeItem("admin_token");
                        setTimeout(() => {
                          router.push("/admin/login");
                        }, 1000);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${pathname === item.path
                        ? "bg-[#2f1107] text-white"
                        : "text-gray-800 hover:bg-[#2f1107]/10 hover:text-[#2f1107]"
                        } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon className="shrink-0" size={22} />
                      {!isSidebarCollapsed && (
                        <span className="font-semibold text-sm whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${pathname === item.path
                        ? "bg-[#2f1107] text-white"
                        : "text-gray-800 hover:bg-[#2f1107]/10 hover:text-[#2f1107]"
                        } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon className="shrink-0" size={22} />
                      {!isSidebarCollapsed && (
                        <span className="font-semibold text-sm whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar - Using SidebarProvider (unchanged) */}
      <div className="lg:hidden">
        <SidebarProvider>
          <Sidebar collapsible="offcanvas">
            <SidebarContent className="py-24 px-6">
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="hidden">Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-3">
                    {items.map((item, idx) => (
                      <SidebarMenuItem key={idx}>
                        {item.path === "/admin/login" ? (
                          <SidebarMenuButton
                            onClick={() => {
                              localStorage.removeItem("admin_token");
                              setTimeout(() => {
                                router.push("/admin/login");
                              }, 1000);
                            }}
                            className={`px-3 py-5 rounded-md flex items-center gap-3 ${pathname === item.path
                              ? "bg-[#2f1107] text-white"
                              : "hover:bg-[#2f1107]/90 hover:text-white"
                              } transition-all duration-300 cursor-pointer`}
                          >
                            <item.icon className="shrink-0" size={20} />
                            <span className="font-medium text-base">{item.label}</span>
                          </SidebarMenuButton>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            className={`px-3 py-5 rounded-md ${pathname === item.path
                              ? "bg-[#2f1107] text-white"
                              : "hover:bg-[#2f1107]/90 hover:text-white"
                              } transition-all duration-300 cursor-pointer`}
                          >
                            <Link href={item.path} className="flex items-center gap-3">
                              <item.icon className="shrink-0" size={20} />
                              <span className="font-medium text-base">{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Main Content Wrapper for Mobile */}
          <div className="w-full">
            {/* Header */}
            <header className="w-full fixed bg-white shadow-md border-b border-[#ecedf2] top-0 left-0 z-[99] h-16 md:h-20">
              <div className="flex items-center justify-between h-full px-6 md:px-[45px]">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <Image
                    className="object-cover"
                    src="/Mocha-e1760632297719.webp"
                    alt="meetlyr"
                    width={70}
                    height={70}
                    priority
                    quality={100}
                  />
                </Link>
                <SidebarTrigger>
                  <MdMenu size={35} />
                </SidebarTrigger>
              </div>
            </header>

            {/* Page Content */}
            <main className="w-full pt-[80px]">{children}</main>
          </div>
        </SidebarProvider>
      </div>

      {/* Desktop Main Content */}
      <div className={`hidden lg:block flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
        {/* Header */}
        <header className="w-full fixed bg-white shadow-md border-b border-[#ecedf2] top-0 right-0 z-30 h-20"
          style={{
            left: isSidebarCollapsed ? '80px' : '256px',
            width: isSidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)',
            transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out'
          }}
        >
          {isSidebarCollapsed && (
            <div className="flex items-center justify-between h-full px-[45px]">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <Image
                  src="/Mocha-e1760632297719.webp"
                  alt="meetlyr"
                  width={140}
                  height={100}
                  priority
                  quality={100}
                />
              </Link>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="w-full pt-[80px] px-6">{children}</main>
      </div>
    </div>
  )
}