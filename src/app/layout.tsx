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
      <body className="antialiased">{children}</body>
    </html>
  );
}
