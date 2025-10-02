import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Mobility Course Mapper",
  description:
    "Check partner university eligibility and map courses before applying for study abroad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://db.onlinewebfonts.com" crossOrigin="anonymous" />
        <link href="https://db.onlinewebfonts.com/c/bad5d85dec62adc89f2f88300b74dd63?family=ABC+Normal+Book" rel="stylesheet" type="text/css" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
