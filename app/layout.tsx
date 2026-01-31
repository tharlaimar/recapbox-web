import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper"; // Wrapper အသစ်လေး ဆောက်ပါမယ်

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const viewport: Viewport = {
  themeColor: "#051139", // 👈 themeColor ကို ဒီထဲရွှေ့လိုက်ပြီ
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "RecapBox",
  description: "Watch and Read your favorite content",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RecapBox",
  }, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* iOS အတွက် Address Bar ပျောက်စေမယ့် meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#051139] text-white overflow-x-hidden min-h-screen flex flex-col`}
      >
        {/* LayoutWrapper ထဲမှာ TopBar နဲ့ BottomNav ကို လိုအပ်သလို ဖျောက်ပေးမယ့် logic ထည့်ထားတယ် */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper> 
      </body>
    </html>
  );
}