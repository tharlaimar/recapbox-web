"use client";

import { pb } from "@/lib/pocketbase";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // 🔥 Client ဘက်ရောက်မှ အလုပ်လုပ်ဖို့

  useEffect(() => {
    setIsMounted(true);
    fetchNotis();
  }, []);

  const fetchNotis = async () => {
    try {
      // ၁။ Database ကယူမယ်
      const records = await pb.collection('announcements').getFullList({
        sort: '-created',
        requestKey: null,
      });

      // ၂။ localStorage စစ်မယ်
      const saved = localStorage.getItem("deleted_notis");
      const deletedIds = saved ? JSON.parse(saved) : [];
      
      // ၃။ Filter လုပ်မယ်
      const visibleNotis = records.filter(noti => !deletedIds.includes(noti.id));
      
      setAnnouncements(visibleNotis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOne = (id: string) => {
    const saved = localStorage.getItem("deleted_notis");
    const deletedIds = saved ? JSON.parse(saved) : [];
    
    // localStorage ထဲ ထည့်သိမ်း
    const updated = [...deletedIds, id];
    localStorage.setItem("deleted_notis", JSON.stringify(updated));
    
    // State ကိုပါ Update လုပ် (UI မှာ ချက်ချင်းပျောက်အောင်)
    setAnnouncements(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("စာတွေအကုန်လုံးကို ဖျက်ပစ်မှာ သေချာလား?")) {
      // လက်ရှိ ရှိသမျှ ID တွေအကုန် localStorage ထဲ ပစ်ထည့်မယ်
      const saved = localStorage.getItem("deleted_notis");
      const deletedIds = saved ? JSON.parse(saved) : [];
      const currentIds = announcements.map(n => n.id);
      
      localStorage.setItem("deleted_notis", JSON.stringify([...deletedIds, ...currentIds]));
      setAnnouncements([]);
    }
  };

  // 🔥 Client-side မရောက်သေးရင် (သို့) loading ဖြစ်နေရင် ဘာမှမပြသေးဘူး
  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[#051139] text-white p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2.5 bg-white/5 rounded-2xl text-gray-400 border border-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="text-xl font-black uppercase tracking-widest">Inbox</h1>
        </div>
        
        {announcements.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-[10px] font-black text-red-400 uppercase border border-red-500/20 px-4 py-2 rounded-2xl bg-red-500/5"
          >
            Clear All
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-[10px] uppercase font-bold text-blue-500 animate-pulse tracking-widest">
            Filtering Messages...
          </div>
        ) : announcements.length > 0 ? (
          announcements.map((noti) => (
            <div key={noti.id} className="relative bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
              <button 
                onClick={() => handleDeleteOne(noti.id)}
                className="absolute top-5 right-5 p-2 text-gray-600 hover:text-red-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h2 className="text-yellow-500 font-black text-sm uppercase mb-2 pr-8">{noti.title}</h2>
              <p className="text-gray-400 text-[13px] leading-relaxed">{noti.message}</p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <span className="text-5xl mb-4">🔔</span>
            <p className="text-[10px] font-black uppercase tracking-widest">No notifications</p>
          </div>
        )}
      </div>
    </main>
  );
}