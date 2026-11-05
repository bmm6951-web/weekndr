import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond, DM_Mono, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "weekndr. | Your semester abroad, all in one place",
  description:
    "Weekndr turns your study abroad academic calendar into a personalized, weekend-by-weekend travel plan. Built for college students spending a semester in Europe. Created by Bhavya Mudduluri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${jost.variable} ${caveat.variable} ${dmMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
