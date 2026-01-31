"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { useEffect, useState } from "react";

export default function TopBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // 🔄 VIP Status အမှန်ကို အချိန်နဲ့တပြေးညီ သိဖို့အတွက် Function
  const fetchFreshUser = async () => {
    if (pb.authStore.isValid && pb.authStore.model?.id) {
      try {
        // Cache မယူဘဲ DB ကနေ အတင်းဆွဲမယ်
        const freshUser = await pb.collection("users").getOne(pb.authStore.model.id, {
          requestKey: null,
          // @ts-ignore
          "t": new Date().getTime(), // Cache Buster
        });
        setUser(freshUser);
      } catch (e) {
        console.error("User fetch error:", e);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // ၁။ စဖွင့်ဖွင့်ချင်း User ကိုဆွဲမယ်
    fetchFreshUser();

    // ၂။ Auth ပြောင်းလဲမှုကို နားထောင်မယ်
    const unsubscribe = pb.authStore.onChange(() => {
      fetchFreshUser();
    });

    // ၃။ 🔥 Magic: ၅ စက္ကန့်တိုင်း နောက်ကွယ်မှာ တိတ်တိတ်လေး လှမ်းစစ်နေမယ်
    // (Admin က VIP ပိတ်လိုက်ရင် ၅ စက္ကန့်အတွင်း Crown ပျောက်သွားအောင်)
    const interval = setInterval(() => {
      if (pb.authStore.isValid) fetchFreshUser();
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Reader နဲ့ Player မှာ Top Bar မလိုဘူး
  if (pathname.includes("/read") || pathname.includes("/watch")) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-[#0f0f0f]/90 backdrop-blur-md z-50 flex items-center justify-between px-4 border-b border-white/5 shadow-2xl">
      
      {/* 1. Left Side: Profile Avatar */}
      <div className="flex items-center">
        <Link href="/profile" className="relative group">
          {/* ✨ VIP ဖြစ်ရင် ရွှေရောင်ဘောင်ပြမယ်၊ ရိုးရိုးဆိုရင် မီးခိုးရောင်ဘောင် */}
          <div className={`w-10 h-10 rounded-full p-[2px] transition-all duration-500 ${
            user?.is_vip 
            ? 'bg-gradient-to-tr from-yellow-600 via-yellow-300 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse-slow' 
            : 'bg-gray-700'
          }`}>
            <div className="w-full h-full rounded-full bg-[#0f0f0f] p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                {user?.avatar || user?.photoURL ? (
                  <img 
                    src={user.avatar ? `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}` : user.photoURL} 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* 👑 VIP Crown Badge (ပုံရဲ့ အပေါ်ထောင့်လေးမှာ ကပ်ပေးထားတယ်) */}
          {user?.is_vip && (
            <div className="absolute -top-3 -right-2 transform group-hover:scale-110 transition-transform">
              <span className="text-[18px] drop-shadow-md filter">👑</span>
            </div>
          )}
        </Link>
      </div>

      {/* 2. Center: Logo / App Name */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/" className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          RECAPBOX
        </Link>
      </div>

      {/* 3. Right Side Icons: Search & Notification */}
      <div className="flex items-center gap-2">
        <Link href="/search" className="p-2 text-gray-300 hover:text-yellow-500 transition active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </Link>

        <button className="relative p-2 text-gray-300 hover:text-yellow-500 transition active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-[#0f0f0f] animate-ping"></span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-[#0f0f0f]"></span>
        </button>
      </div>

    </div>
  );
}