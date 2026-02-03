"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { useEffect, useState, useRef } from "react";

export default function TopBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [hasNew, setHasNew] = useState(false);

  const fetchFreshUser = async () => {
    if (pb.authStore.isValid && pb.authStore.model?.id) {
      try {
        const freshUser = await pb.collection("users").getOne(pb.authStore.model.id, {
          requestKey: null,
          // @ts-ignore
          "t": new Date().getTime(),
        });
       // 🛡️ [Device Security Check] 
        // Admin က device_ids ကို clear လုပ်လိုက်ရင် (စာရင်းအားသွားရင်) အလိုအလျောက် Logout လုပ်ခိုင်းမယ်
        const currentDeviceId = navigator.userAgent;
        if (freshUser.device_ids && freshUser.device_ids.length === 0) {
           pb.authStore.clear();
           window.location.href = "/login"; // Login ပြန်ခိုင်းတာ
           return;
        }

        // လက်ရှိ Device က စာရင်းထဲမှာ မရှိတော့ရင် (Admin က တစ်လုံးချင်းဖျက်လိုက်ရင်) Logout လုပ်မယ်
        if (freshUser.device_ids && !freshUser.device_ids.includes(currentDeviceId)) {
           pb.authStore.clear();
           window.location.href = "/login";
           return;
        } 
        setUser(freshUser);
      } catch (e) {
        console.error("User fetch error:", e);
      }
    } else {
      setUser(null);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const records = await pb.collection("announcements").getList(1, 5, {
        sort: "-created",
        requestKey: null,
      });
      setAnnouncements(records.items);
      const lastSeen = localStorage.getItem("last_noti_id");
      if (records.items.length > 0 && records.items[0].id !== lastSeen) {
        setHasNew(true);
      }
    } catch (e) {
      console.error("Announcements error:", e);
    }
  };

  useEffect(() => {
    fetchFreshUser();
    fetchAnnouncements();
    const unsubscribeAuth = pb.authStore.onChange(() => fetchFreshUser());

    pb.collection("announcements").subscribe("*", (e) => {
      if (e.action === "create") {
        setAnnouncements(prev => [e.record, ...prev].slice(0, 5));
        setHasNew(true);
      }
    });

    const interval = setInterval(() => {
      if (pb.authStore.isValid) fetchFreshUser();
    }, 60000);

    return () => {
      unsubscribeAuth();
      pb.collection("announcements").unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (pathname.includes("/read") || pathname.includes("/watch")) return null;

  return (
    <>
      {/* Container ကို fixed ထားပြီး အထဲမှာ အထပ်လိုက် စီမယ် (Design ကို မထိခိုက်အောင်) */}
      <div className="fixed top-0 left-0 w-full z-[99999] flex flex-col gap-0 shadow-2xl">
        
        {/* ၁။ ပင်မ TopBar ( Design အတိုင်း လုံးဝ မပြောင်းလဲပါ) */}
        <div className="w-full h-16 bg-[#0f0f0f]/90 backdrop-blur-md flex items-center justify-between px-4 border-b border-white/5">
          
          {/* Left Side: Profile Avatar */}
          <div className="flex items-center">
            <Link href="/profile" className="relative group">
              <div className={`w-10 h-10 rounded-full p-[2px] transition-all duration-500 ${user?.is_vip ? 'bg-gradient-to-tr from-yellow-600 via-yellow-300 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse-slow' : 'bg-gray-700'}`}>
                <div className="w-full h-full rounded-full bg-[#0f0f0f] p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                    {user?.avatar || user?.photoURL ? (
                      <img src={user.avatar ? `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}` : user.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                  </div>
                </div>
              </div>
              {user?.is_vip && <div className="absolute -top-3 -right-2 transform group-hover:scale-110 transition-transform"><span className="text-[18px] drop-shadow-md filter">👑</span></div>}
            </Link>
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">RECAPBOX</Link>
          </div>

          {/* Right Side: Icons */}
          <div className="flex items-center gap-2">
            <Link href="/search" className="p-2 text-gray-300 hover:text-yellow-500 transition active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </Link>

            <Link href="/notifications" className="relative p-2 text-gray-300 hover:text-yellow-500 transition active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
              {hasNew && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-[#0f0f0f] animate-pulse"></span>}
            </Link>
          </div>
        </div>

        {/* ၂။ VIP Marquee - အောက်ခြေမှာ ကပ်ရက် (Free User သာ) */}
        {!user?.is_vip && (
          <div className="w-full bg-yellow-500 py-0.5 shadow-lg overflow-hidden border-t border-black/5">
            <Link href="/profile" className="block whitespace-nowrap overflow-hidden">
              <div className="inline-block animate-marquee-fast">
                <span className="text-[10px] font-black uppercase tracking-widest text-black px-4">
                  🔥 Become a VIP to unlock all vip contact and support RECAPBOX! 🔥
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-black px-4">
                  🔥 Become a VIP to unlock all vip contact and support RECAPBOX! 🔥
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* ⚠️ Content တွေ တွန်းချဖို့ Spacer (Design ကွက်တိဖြစ်အောင်) */}
      <div className={`${!user?.is_vip ? 'h-[40px]' : 'h-16'}`}></div>

      <style jsx global>{`
        @keyframes marqueeFast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-fast {
          display: inline-block;
          animation: marqueeFast 20s linear infinite;
        }
      `}</style>
    </>
  );
}