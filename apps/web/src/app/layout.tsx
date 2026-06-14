import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APIWitness - The Witness For Every API Failure",
  description:
    "APIWitness records failed API requests in React Native and Expo apps and generates developer-ready debugging reports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
