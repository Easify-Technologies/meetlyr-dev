import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Meetlyr",
  description: "Meet new people and Share real moments",
  icons: {
    icon: "/mocha-favicon-ico.webp",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
