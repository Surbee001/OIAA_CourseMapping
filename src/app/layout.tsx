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
        <link rel="preconnect" href="https://raw.githubusercontent.com" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'ABC Normal Book';
              src: url('https://raw.githubusercontent.com/Surbee001/webimg/main/ABC%20Normal%20Book.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
          `
        }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
