"use client"

import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { MdMenu } from "react-icons/md"
import { IoHomeOutline } from "react-icons/io5"
import { LuCircleUserRound } from "react-icons/lu";
import { FaMapLocationDot } from "react-icons/fa6";
import { MdEvent, MdCoffee, MdEventSeat } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { GiForkKnifeSpoon } from "react-icons/gi";
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
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const items = [
    { icon: IoHomeOutline, label: "Dashboard", path: "/admin/dashboard" },
    { icon: LuCircleUserRound, label: "Users", path: "/admin/users" },
    { icon: FaMapLocationDot, label: "Locations", path: "/admin/locations" },
    { icon: MdEvent, label: "Events", path: "/admin/events" },
    { icon: MdEventSeat, label: "Event Participants", path: "/admin/participants" },
    { icon: MdCoffee, label: "Cafes", path: "/admin/cafe" },
    { icon: GiForkKnifeSpoon, label: "Manual Matching", path: "/admin/match-event"},
    { icon: IoIosLogOut, label: "Logout", path: "/admin/login" },
  ]

  return (
    <SidebarProvider className="max-w-full">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="transition-transform">
          <SidebarContent className="py-28 px-6 md:px-8">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="hidden">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-3">
                  {items.map((item, idx) => (
                    <SidebarMenuItem key={idx}>
                      {item.path === "/admin/login" ? (
                        <SidebarMenuButton
                          onClick={() => signOut()}
                          className={`px-3 py-5 rounded-md flex items-center gap-3 ${
                            pathname === item.path
                              ? "bg-[#2f1107] text-white"
                              : "hover:bg-[#2f1107]/90 hover:text-white"
                          } transition-all duration-300 cursor-pointer`}
                        >
                          <item.icon className="shrink-0" />
                          <span className="font-medium text-base">{item.label}</span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          className={`px-3 py-5 rounded-md ${
                            pathname === item.path
                              ? "bg-[#2f1107] text-white"
                              : "hover:bg-[#2f1107]/90 hover:text-white"
                          } transition-all duration-300 cursor-pointer`}
                        >
                          <Link href={item.path} className="flex items-center gap-3">
                            <item.icon className="shrink-0" />
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

        {/* Main Content */}
        <div className="flex flex-col w-full">
          {/* Header */}
          <header className="w-full fixed bg-white shadow-md border-b border-[#ecedf2] top-0 left-0 z-[99] h-16 md:h-20">
            <div className="flex items-center justify-between h-full px-6 md:px-[45px]">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image
                  className="object-cover hidden md:block"
                  src="/Mocha-e1760632297719.webp"
                  alt="meetlyr"
                  width={140}
                  height={100}
                  priority
                  quality={100}
                />
                <Image
                  className="object-cover md:hidden block"
                  src="/Mocha-e1760632297719.webp"
                  alt="meetlyr"
                  width={70}
                  height={70}
                  priority
                  quality={100}
                />
              </Link>
              <SidebarTrigger className="md:hidden block">
                <MdMenu size={35} />
              </SidebarTrigger>
            </div>
          </header>

          {/* Page Content */}
          <main className="w-full pt-[80px]">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
