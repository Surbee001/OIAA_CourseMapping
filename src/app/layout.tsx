import type { Metadata } from "next";
import Script from "next/script";
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
        <link 
          href="https://db.onlinewebfonts.com/c/bad5d85dec62adc89f2f88300b74dd63?family=ABC+Normal+Book" 
          rel="stylesheet" 
          type="text/css"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'ABC Normal Book';
              src: url('https://db.onlinewebfonts.com/t/bad5d85dec62adc89f2f88300b74dd63.eot');
              src: url('https://db.onlinewebfonts.com/t/bad5d85dec62adc89f2f88300b74dd63.eot?#iefix') format('embedded-opentype'),
                   url('https://db.onlinewebfonts.com/t/bad5d85dec62adc89f2f88300b74dd63.woff2') format('woff2'),
                   url('https://db.onlinewebfonts.com/t/bad5d85dec62adc89f2f88300b74dd63.woff') format('woff'),
                   url('https://db.onlinewebfonts.com/t/bad5d85dec62adc89f2f88300b74dd63.ttf') format('truetype'),
                   url('https://db.onlinewebfonts.com/t/bad5d85dec62adc89f2f88300b74dd63.svg#ABC Normal Book') format('svg');
              font-display: swap;
            }
          `
        }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
