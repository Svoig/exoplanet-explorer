import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geo = localFont({
  variable: '--font-geo',
  src: [
    {
      path: "../public/Geo-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/Geo-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
});

export const metadata: Metadata = {
  title: "Exoplanet Explorer",
  description:
    "A scientific catalogue for nearby and notable exoplanet systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geo.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
