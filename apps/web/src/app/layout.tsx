import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "APIWitness — API Observability for Mobile Apps",
  description:
    "APIWitness detects breaking API changes before users do. Record real API traffic from React Native and Expo apps, detect failures, track response changes, and generate documentation.",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23111'/%3E%3Ccircle cx='16' cy='16' r='2' fill='white'/%3E%3Ccircle cx='16' cy='16' r='7' fill='none' stroke='white' stroke-width='1.5' stroke-dasharray='2 2.5'/%3E%3Cpath d='M16 9a7 7 0 0 1 7 7' fill='none' stroke='white' stroke-width='1.5' stroke-dasharray='1.5 2' opacity='0.5'/%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="bg-white text-neutral-900 font-sans">{children}</body>
    </html>
  );
}
