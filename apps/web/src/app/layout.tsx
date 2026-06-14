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
