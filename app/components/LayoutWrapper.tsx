"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const refreshAuth = async () => {
    if (pb.authStore.isValid) {
      try {
        // 🚀 လက်ရှိ User Data ကို PocketBase ဆီကနေ အသစ်ပြန်တောင်းမယ်
        await pb.collection("users").authRefresh();
        console.log("User VIP Status Updated!");
      } catch (err) {
        console.error("Auth refresh failed:", err);
      }
    }
  }
    // 🔍 အကောင့်ဝင်ထားသလား စစ်မယ်
    setIsLoggedIn(pb.authStore.isValid);

    const unsubscribe = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid);
    });

    return () => unsubscribe();
  }, []);

  // 🚫 Bar တွေ ဖျောက်ချင်တဲ့ Page များ
  const hideTopBarPaths = ["/profile", "/manga/", "/novels/", "/series/", "/register"];
  const hideBottomNavPaths = [ "/register"];

  const shouldHideTopBar = hideTopBarPaths.some(path => pathname.includes(path));
  const shouldHideBottomNav = hideBottomNavPaths.some(path => pathname.includes(path));

  // 🔥 အဓိက Logic: အကောင့်မဝင်ထားရင် ဘာ Bar မှ မပြဘူး (Login/Register ပဲ မြင်ရမယ်)
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#051139]">
        {children}
      </main>
    );
  }

  // ✅ အကောင့်ဝင်ထားမှသာ ကျန်တဲ့ Bar တွေ ပေါ်မယ်
  return (
    <>
      {!shouldHideTopBar && <TopBar />}

      <main className={`flex-grow relative z-0 ${!shouldHideTopBar ? 'pt-16' : 'pt-0'} ${!shouldHideBottomNav ? 'pb-24' : 'pb-0'}`}>
        {children}
      </main>

      {!shouldHideBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      )}
    </>
  );
}