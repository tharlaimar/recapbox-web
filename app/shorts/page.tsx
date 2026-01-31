"use client";

import { useEffect, useRef, useState } from "react";
import { pb } from "@/lib/pocketbase";

export default function ShortsPage() {
  const [shorts, setShorts] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Shorts Data
  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const records = await pb.collection('shorts').getFullList({
          sort: '-created',
          requestKey: null, // 🔥 Cancellation fix
        });
        setShorts(records);
      } catch (err) {
        console.error("Shorts fetch error:", err);
      }
    };
    fetchShorts();
  }, []);

  // 2. Auto-Play & Sound Control Logic (အသံမထပ်အောင် ပြင်ထားသည်)
  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.8, // ၈၀% မြင်ရမှ အသံစထွက်မယ်
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const iframe = entry.target.querySelector("iframe");
        if (iframe && iframe.contentWindow) {
          if (entry.isIntersecting) {
            // ✅ လက်ရှိဗီဒီယိုကို Play မယ် + အသံဖွင့်မယ်
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
          } else {
            // ❌ ကျော်သွားတဲ့ဗီဒီယိုကို Pause မယ် + အသံချက်ချင်းပိတ်မယ်
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
          }
        }
      });
    }, observerOptions);

    const videoElements = document.querySelectorAll(".short-video-container");
    videoElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [shorts]);

  return (
    // ⚠️ Main Tag Fix: Layout နဲ့ ထပ်မနေအောင် div ပြောင်းပြီး အကြည်သားလုပ်ထားတယ်
    <div 
      ref={containerRef}
      className="fixed inset-0 top-16 bottom-16 overflow-y-scroll snap-y snap-mandatory bg-transparent scrollbar-hide"
    >
      {shorts.length > 0 ? (
        shorts.map((short) => (
          <div 
            key={short.id} 
            className="short-video-container h-full w-full snap-start relative flex items-center justify-center bg-black"
          >
            {/* 📺 Video Container */}
            <div className="w-full h-full relative">
              <iframe
                src={`https://www.youtube.com/embed/${short.video_id}?enablejsapi=1&autoplay=0&rel=0&modestbranding=1&loop=1&playlist=${short.video_id}&controls=1`}
                className="w-full h-full" 
                allow="autoplay; encrypted-media"
                title={short.title}
              />
              {/* ✨ Overlay Gradient (စာသားပေါ်လွင်အောင်) */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
            </div>

            {/* 🏷️ Info Overlay (Premium Design) */}
            <div className="absolute bottom-10 left-4 z-10 pointer-events-none mb-4 w-[80%]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]">
                   <div className="w-full h-full rounded-full bg-[#051139] flex items-center justify-center border border-white/10 overflow-hidden">
                      <span className="text-[10px] font-black italic text-white">RECAP</span>
                   </div>
                </div>
                <div>
                  <h3 className="text-white font-black text-sm drop-shadow-xl tracking-tight">@{short.creator || "RecapBox"}</h3>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">Original Content</p>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl">
                <p className="text-gray-100 text-sm font-bold leading-snug drop-shadow-md line-clamp-2">
                  {short.title}
                </p>
              </div>
            </div>

            {/* ❤️ Side Buttons (အကြည်သားလေးတွေ) */}
            <div className="absolute right-4 bottom-24 z-20 flex flex-col gap-6 pointer-events-none opacity-90">
                <div className="flex flex-col items-center gap-1">
                  <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
                     <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                  <span className="text-[10px] font-black text-white/80 drop-shadow-md">LIKE</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  </div>
                  <span className="text-[10px] font-black text-white/80 drop-shadow-md">SHARE</span>
                </div>
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex items-center justify-center bg-transparent">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}